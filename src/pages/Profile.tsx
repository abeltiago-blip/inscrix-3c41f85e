import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Edit,
  Save,
  Camera,
  FileText,
  Activity,
  Award,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatDocumentInput, getDocumentTypeInfo } from "@/utils/documentValidation";
import Header from "@/components/Header";

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalEvents: 0,
    completedEvents: 0,
    totalSpent: 0
  });

  // Include all profile fields that exist in the database
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    organization_name: '',
    team_name: '',
    team_captain_name: '',
    birth_date: '',
    gender: '',
    nationality: 'Portugal',
    document_number: '',
    nif: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    // Address fields
    username: '',
    street: '',
    street_number: '',
    city: '',
    postal_code: '',
    // Company/Organization fields (for organizers)
    company_nif: '',
    company_address: '',
    company_city: '',
    company_phone: '',
    support_email: '',
    cae: '',
    // Team fields
    team_description: '',
    affiliation_code: '',
    // Event registration fields
    tshirt_size: '',
    medical_conditions: ''
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        organization_name: profile.organization_name || '',
        team_name: profile.team_name || '',
        team_captain_name: profile.team_captain_name || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        nationality: profile.nationality || 'Portugal',
        document_number: profile.document_number || '',
        nif: profile.nif || '',
        emergency_contact_name: profile.emergency_contact_name || '',
        emergency_contact_phone: profile.emergency_contact_phone || '',
        // Address fields
        username: profile.username || '',
        street: profile.street || '',
        street_number: profile.street_number || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        // Company/Organization fields
        company_nif: profile.company_nif || '',
        company_address: profile.company_address || '',
        company_city: profile.company_city || '',
        company_phone: profile.company_phone || '',
        support_email: profile.support_email || '',
        cae: profile.cae || '',
        // Team fields
        team_description: profile.team_description || '',
        affiliation_code: profile.affiliation_code || '',
        // Event registration fields
        tshirt_size: profile.tshirt_size || '',
        medical_conditions: profile.medical_conditions || ''
      });
    }

    fetchUserStats();
  }, [user, profile, navigate]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch registrations
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('amount_paid, events(status)')
        .eq('participant_id', user.id);

      if (regError) throw regError;

      // Fetch events if user is organizer
      let eventsData = [];
      if (profile?.role === 'organizer') {
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('status')
          .eq('organizer_id', user.id);

        if (eventsError) throw eventsError;
        eventsData = events || [];
      }

      const totalRegistrations = registrations?.length || 0;
      const completedEvents = registrations?.filter(reg => reg.events?.status === 'completed').length || 0;
      const totalSpent = registrations?.reduce((sum, reg) => sum + (reg.amount_paid || 0), 0) || 0;
      const totalEvents = eventsData.length;

      setStats({
        totalRegistrations,
        totalEvents,
        completedEvents,
        totalSpent
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Clear document field when nationality changes
      if (field === 'nationality') {
        updated.document_number = '';
      }
      
      return updated;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('💾 Updating profile with data:', formData);
      
      const { error } = await updateProfile(formData);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "As suas informações foram guardadas com sucesso",
      });

      setEditing(false);
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao guardar as alterações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrador', variant: 'destructive' as const, icon: Shield },
      organizer: { label: 'Organizador', variant: 'default' as const, icon: Award },
      participant: { label: 'Participante', variant: 'secondary' as const, icon: User },
      team: { label: 'Equipa', variant: 'outline' as const, icon: User }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.participant;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">A carregar perfil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerir as suas informações pessoais e preferências
            </p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'A guardar...' : 'Guardar'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscrições</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">eventos inscritos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedEvents}</div>
              <p className="text-xs text-muted-foreground">eventos finalizados</p>
            </CardContent>
          </Card>

          {profile.role === 'organizer' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Criados</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">eventos organizados</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">em inscrições</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Pessoal</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
            <TabsTrigger value="address">Morada</TabsTrigger>
            <TabsTrigger value="organization">Organização</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Dados básicos do seu perfil</CardDescription>
                  </div>
                  {getRoleBadge(profile.role)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Primeiro Nome</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Último Nome</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Género</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => handleInputChange('gender', value)}
                      disabled={!editing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nacionalidade</Label>
                    <Select 
                      value={formData.nationality} 
                      onValueChange={(value) => handleInputChange('nationality', value)}
                      disabled={!editing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a nacionalidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Portugal">Portugal</SelectItem>
                        <SelectItem value="Espanha">Espanha</SelectItem>
                        <SelectItem value="França">França</SelectItem>
                        <SelectItem value="Itália">Itália</SelectItem>
                        <SelectItem value="Alemanha">Alemanha</SelectItem>
                        <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                        <SelectItem value="Brasil">Brasil</SelectItem>
                        <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document_number">{getDocumentTypeInfo(formData.nationality).name}</Label>
                    <Input
                      id="document_number"
                      value={formData.document_number}
                      onChange={(e) => {
                        const formatted = formatDocumentInput(e.target.value, formData.nationality);
                        handleInputChange('document_number', formatted);
                      }}
                      disabled={!editing}
                      placeholder={getDocumentTypeInfo(formData.nationality).placeholder}
                      maxLength={getDocumentTypeInfo(formData.nationality).placeholder.length || 20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nif">NIF</Label>
                    <Input
                      id="nif"
                      value={formData.nif}
                      onChange={(e) => handleInputChange('nif', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={!editing}
                      placeholder="Nome de utilizador único"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!editing}
                    placeholder="Conte-nos um pouco sobre si..."
                    rows={3}
                  />
                </div>

                {profile.role === 'team' && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Informações da Equipa</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="team_name">Nome da Equipa</Label>
                        <Input
                          id="team_name"
                          value={formData.team_name}
                          onChange={(e) => handleInputChange('team_name', e.target.value)}
                          disabled={!editing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="team_captain_name">Nome do Capitão</Label>
                        <Input
                          id="team_captain_name"
                          value={formData.team_captain_name}
                          onChange={(e) => handleInputChange('team_captain_name', e.target.value)}
                          disabled={!editing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="affiliation_code">Código de Afiliação</Label>
                        <Input
                          id="affiliation_code"
                          value={formData.affiliation_code}
                          onChange={(e) => handleInputChange('affiliation_code', e.target.value)}
                          disabled={!editing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team_description">Descrição da Equipa</Label>
                      <Textarea
                        id="team_description"
                        value={formData.team_description}
                        onChange={(e) => handleInputChange('team_description', e.target.value)}
                        disabled={!editing}
                        placeholder="Descrição da equipa..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Preferências de Eventos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tshirt_size">Tamanho de T-shirt</Label>
                      <Select 
                        value={formData.tshirt_size} 
                        onValueChange={(value) => handleInputChange('tshirt_size', value)}
                        disabled={!editing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medical_conditions">Condições Médicas/Alergias</Label>
                    <Textarea
                      id="medical_conditions"
                      value={formData.medical_conditions}
                      onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                      disabled={!editing}
                      placeholder="Descreva qualquer condição médica ou alergia relevante..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contacto</CardTitle>
                <CardDescription>Email, telefone e contacto de emergência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Contacto de Emergência
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Nome do Contacto</Label>
                      <Input
                        id="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                        disabled={!editing}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">Telefone do Contacto</Label>
                      <Input
                        id="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                        disabled={!editing}
                        placeholder="Número de telefone"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Morada
                </CardTitle>
                <CardDescription>Informações de morada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      disabled={!editing}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street_number">Número</Label>
                    <Input
                      id="street_number"
                      value={formData.street_number}
                      onChange={(e) => handleInputChange('street_number', e.target.value)}
                      disabled={!editing}
                      placeholder="Nº"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!editing}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Código Postal</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      disabled={!editing}
                      placeholder="0000-000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organization" className="space-y-4">
            {profile.role === 'organizer' && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Award className="h-4 w-4 inline mr-2" />
                    Informações da Organização
                  </CardTitle>
                  <CardDescription>Dados da sua empresa/organização</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization_name">Nome da Organização</Label>
                      <Input
                        id="organization_name"
                        value={formData.organization_name}
                        onChange={(e) => handleInputChange('organization_name', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_nif">NIPC da Empresa</Label>
                      <Input
                        id="company_nif"
                        value={formData.company_nif}
                        onChange={(e) => handleInputChange('company_nif', e.target.value)}
                        disabled={!editing}
                        placeholder="Número de identificação"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_address">Morada da Empresa</Label>
                      <Input
                        id="company_address"
                        value={formData.company_address}
                        onChange={(e) => handleInputChange('company_address', e.target.value)}
                        disabled={!editing}
                        placeholder="Morada completa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_city">Cidade da Empresa</Label>
                      <Input
                        id="company_city"
                        value={formData.company_city}
                        onChange={(e) => handleInputChange('company_city', e.target.value)}
                        disabled={!editing}
                        placeholder="Cidade"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_phone">Telefone da Empresa</Label>
                      <Input
                        id="company_phone"
                        value={formData.company_phone}
                        onChange={(e) => handleInputChange('company_phone', e.target.value)}
                        disabled={!editing}
                        placeholder="Telefone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="support_email">Email de Suporte</Label>
                      <Input
                        id="support_email"
                        type="email"
                        value={formData.support_email}
                        onChange={(e) => handleInputChange('support_email', e.target.value)}
                        disabled={!editing}
                        placeholder="suporte@empresa.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cae">CAE</Label>
                      <Input
                        id="cae"
                        value={formData.cae}
                        onChange={(e) => handleInputChange('cae', e.target.value)}
                        disabled={!editing}
                        placeholder="Código de atividade económica"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.role !== 'organizer' && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Esta secção é apenas para organizadores de eventos.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;