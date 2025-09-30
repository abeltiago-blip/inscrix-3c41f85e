import { useState, useEffect } from 'react';
import { Users, QrCode, Download, Search, Filter, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QRCodeScanner } from './QRCodeScanner';
import { EventQRCode } from './EventQRCode';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

interface CheckinRecord {
  id: string;
  participant_name: string;
  participant_email: string;
  checkin_time: string;
  checkin_method: string;
  scanner_user_id?: string;
  registration_id?: string;
}

interface EventCheckinManagerProps {
  eventId: string;
  eventTitle: string;
  className?: string;
}

export function EventCheckinManager({ 
  eventId, 
  eventTitle,
  className = "" 
}: EventCheckinManagerProps) {
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0
  });

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for checkins
    const checkinSubscription = supabase
      .channel('event_checkins')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'event_checkins',
          filter: `event_id=eq.${eventId}`
        }, 
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      checkinSubscription.unsubscribe();
    };
  }, [eventId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load registrations
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'active')
        .order('participant_name');

      if (regError) throw regError;

      // Load check-ins
      const { data: checkinData, error: checkinError } = await supabase
        .from('event_checkins')
        .select('*')
        .eq('event_id', eventId)
        .order('checkin_time', { ascending: false });

      if (checkinError) throw checkinError;

      setRegistrations(regData || []);
      setCheckins(checkinData || []);

      // Calculate stats
      const totalRegistrations = regData?.length || 0;
      const totalCheckins = checkinData?.length || 0;
      
      setStats({
        total: totalRegistrations,
        checkedIn: totalCheckins,
        pending: totalRegistrations - totalCheckins
      });

    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load check-in data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCheckin = async (registration: any) => {
    try {
      // Check if already checked in
      const existingCheckin = checkins.find(c => c.registration_id === registration.id);
      if (existingCheckin) {
        toast.warning('Participant already checked in');
        return;
      }

      const { error } = await supabase
        .from('event_checkins')
        .insert({
          event_id: eventId,
          registration_id: registration.id,
          participant_id: registration.participant_id,
          participant_name: registration.participant_name,
          participant_email: registration.participant_email,
          checkin_method: 'manual',
          scanner_user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast.success(`✅ ${registration.participant_name} checked in!`);
    } catch (err) {
      console.error('Manual check-in error:', err);
      toast.error('Failed to check in participant');
    }
  };

  const exportCheckins = () => {
    const csvContent = [
      ['Name', 'Email', 'Check-in Time', 'Method'].join(','),
      ...checkins.map(checkin => [
        checkin.participant_name,
        checkin.participant_email,
        format(new Date(checkin.checkin_time), 'dd/MM/yyyy HH:mm', { locale: pt }),
        checkin.checkin_method
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventTitle}-checkins.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Check-in list exported!');
  };

  const getFilteredData = () => {
    let filtered = registrations;

    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.participant_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      const checkedInIds = new Set(checkins.map(c => c.registration_id));
      
      if (filterStatus === 'checked_in') {
        filtered = filtered.filter(reg => checkedInIds.has(reg.id));
      } else {
        filtered = filtered.filter(reg => !checkedInIds.has(reg.id));
      }
    }

    return filtered.map(reg => ({
      ...reg,
      isCheckedIn: checkins.find(c => c.registration_id === reg.id),
      checkinTime: checkins.find(c => c.registration_id === reg.id)?.checkin_time
    }));
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading check-in data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Check-in</p>
                <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="participants" className="w-full">
        <TabsList>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="not_checked_in">Not Checked In</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={exportCheckins} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Participants Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredData().map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {participant.participant_name}
                    </TableCell>
                    <TableCell>{participant.participant_email}</TableCell>
                    <TableCell>
                      {participant.isCheckedIn ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Checked In
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.checkinTime ? 
                        format(new Date(participant.checkinTime), 'dd/MM HH:mm', { locale: pt }) : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {!participant.isCheckedIn && (
                        <Button 
                          size="sm" 
                          onClick={() => handleManualCheckin(participant)}
                        >
                          Check In
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="scanner">
          <QRCodeScanner 
            eventId={eventId}
            onScanSuccess={() => {
              // Refresh data after successful scan
              loadData();
            }}
          />
        </TabsContent>

        <TabsContent value="qr-codes">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EventQRCode 
              eventId={eventId} 
              eventTitle={eventTitle} 
              qrType="checkin" 
            />
            <EventQRCode 
              eventId={eventId} 
              eventTitle={eventTitle} 
              qrType="info" 
            />
            <EventQRCode 
              eventId={eventId} 
              eventTitle={eventTitle} 
              qrType="feedback" 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}