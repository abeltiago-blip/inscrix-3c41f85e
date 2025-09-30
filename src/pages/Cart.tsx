import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import ParticipantRegistrationModal from "@/components/ParticipantRegistrationModal";

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    item: any;
    index: number;
    event: any;
    ticketTypes: any[];
  } | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleQuantityChange = (eventId: string, ticketTypeId: string, newQuantity: number) => {
    updateQuantity(eventId, ticketTypeId, newQuantity);
  };

  const handleRemoveItem = (eventId: string, ticketTypeId: string, eventTitle: string, index?: number) => {
    removeItem(eventId, ticketTypeId, index);
    toast({
      title: "Item removido",
      description: `${eventTitle} foi removido do carrinho.`,
    });
  };

  const handleEditItem = async (item: any, index: number) => {
    try {
      // Fetch event data
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', item.eventId)
        .single();

      if (eventError) throw eventError;

      // Fetch ticket types
      const { data: ticketTypes, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', item.eventId);

      if (ticketError) throw ticketError;

      setEditingItem({
        item,
        index,
        event: eventData,
        ticketTypes: ticketTypes || [],
      });
      setEditModalOpen(true);
    } catch (error) {
      console.error('Error loading edit data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados para edição.",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos do carrinho.",
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">O seu carrinho está vazio</h2>
              <p className="text-muted-foreground mb-6">
                Explore os nossos eventos e adicione alguns ao seu carrinho.
              </p>
              <Button asChild>
                <Link to="/eventos">
                  Explorar Eventos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild>
              <Link to="/eventos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuar a explorar
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Carrinho de Compras</CardTitle>
                      <CardDescription>
                        {items.length} {items.length === 1 ? 'item' : 'itens'} no carrinho
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearCart}
                    >
                      Limpar Carrinho
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <div key={`${item.eventId}-${item.ticketTypeId}-${index}`} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.eventTitle}</h3>
                          <p className="text-muted-foreground">{item.eventLocation}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.eventDate).toLocaleDateString('pt-PT')}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {item.ticketTypeName}
                          </Badge>
                          
                          {/* Mostrar dados do participante se existirem */}
                          {item.participantData && (
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <p className="font-medium text-sm">Participante:</p>
                              <p className="text-sm">{item.participantData.name}</p>
                              <p className="text-xs text-muted-foreground">
                                CC: {item.participantData.documentNumber}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {/* Botão Editar - apenas para inscrições com dados de participante */}
                          {item.participantData && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item, index)}
                              title="Editar inscrição"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Botão Remover */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.eventId, item.ticketTypeId, item.eventTitle, item.participantData ? index : undefined)}
                            title="Remover do carrinho"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        {/* Mostrar controlos de quantidade apenas se não houver dados de participante */}
                        {!item.participantData ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.eventId, item.ticketTypeId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.eventId, item.ticketTypeId, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Inscrição individual
                          </div>
                        )}
                        <div className="text-right">
                          <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                          {!item.participantData && (
                            <p className="text-sm text-muted-foreground">€{item.price.toFixed(2)} cada</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={`${item.eventId}-${item.ticketTypeId}-${index}`} className="flex justify-between text-sm">
                        <span>
                          {item.eventTitle}
                          {item.participantData ? ` - ${item.participantData.name}` : ` x${item.quantity}`}
                        </span>
                        <span>€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>€{getTotal().toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate("/checkout")}
                  >
                    Finalizar Inscrição
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>✓ Inscrição segura</p>
                    <p>✓ Confirmação instantânea</p>
                    <p>✓ Suporte 24/7</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Modal de Edição */}
          {editingItem && (
            <ParticipantRegistrationModal
              event={editingItem.event}
              ticketTypes={editingItem.ticketTypes}
              isOpen={editModalOpen}
              onClose={() => {
                setEditModalOpen(false);
                setEditingItem(null);
              }}
              editMode={true}
              editIndex={editingItem.index}
              initialData={{
                ticketTypeId: editingItem.item.ticketTypeId,
                participantData: editingItem.item.participantData,
              }}
              onAddToCart={() => {}} // Not used in edit mode
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}