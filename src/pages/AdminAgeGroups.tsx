import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  ArrowUpDown,
  Save,
  X,
  ArrowLeft,
  Upload,
  FileText,
  Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { getAllCategories } from "@/data/eventCategories";

interface AgeGroup {
  id: string;
  category_id: string;
  subcategory: string | null;
  name: string;
  min_age: number | null;
  max_age: number | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const AdminAgeGroups = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingGroup, setEditingGroup] = useState<AgeGroup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState<string>("");
  const [importCategory, setImportCategory] = useState<string>("");
  const [importSubcategory, setImportSubcategory] = useState<string>("none");

  const [formData, setFormData] = useState({
    category_id: "",
    subcategory: "none",
    name: "",
    min_age: "",
    max_age: "",
    description: "",
    is_active: true,
    sort_order: "0"
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (profile?.role !== 'admin') {
      navigate("/dashboard");
      return;
    }
    loadAgeGroups();
  }, [user, profile, navigate]);

  const loadAgeGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('age_groups')
        .select('*')
        .order('category_id')
        .order('sort_order');

      if (error) throw error;
      setAgeGroups(data || []);
    } catch (error) {
      console.error('Error loading age groups:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar escalões etários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: "",
      subcategory: "none",
      name: "",
      min_age: "",
      max_age: "",
      description: "",
      is_active: true,
      sort_order: "0"
    });
    setEditingGroup(null);
  };

  const handleSubmit = async () => {
    if (!formData.category_id || !formData.name) {
      toast({
        title: "Erro",
        description: "Por favor preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const ageGroupData = {
        category_id: formData.category_id,
        subcategory: formData.subcategory === "none" ? null : formData.subcategory,
        name: formData.name,
        min_age: formData.min_age ? parseInt(formData.min_age) : null,
        max_age: formData.max_age ? parseInt(formData.max_age) : null,
        description: formData.description || null,
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order)
      };

      if (editingGroup) {
        const { error } = await supabase
          .from('age_groups')
          .update(ageGroupData)
          .eq('id', editingGroup.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Escalão atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('age_groups')
          .insert(ageGroupData);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Escalão criado com sucesso",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      loadAgeGroups();
    } catch (error) {
      console.error('Error saving age group:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar escalão",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (group: AgeGroup) => {
    setEditingGroup(group);
    setFormData({
      category_id: group.category_id,
      subcategory: group.subcategory || "none",
      name: group.name,
      min_age: group.min_age?.toString() || "",
      max_age: group.max_age?.toString() || "",
      description: group.description || "",
      is_active: group.is_active,
      sort_order: group.sort_order.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que pretende eliminar este escalão?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('age_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Escalão eliminado com sucesso",
      });
      loadAgeGroups();
    } catch (error) {
      console.error('Error deleting age group:', error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar escalão",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!importCategory || !importData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor selecione uma categoria e cole os dados da tabela",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse CSV-like data (tab or comma separated)
      const lines = importData.trim().split('\n');
      const ageGroupsToImport = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Try tab-separated first, then comma-separated
        let columns = line.split('\t');
        if (columns.length < 3) {
          columns = line.split(',');
        }

        if (columns.length >= 3) {
          const [name, minAge, maxAge, description] = columns.map(col => col.trim());
          
          ageGroupsToImport.push({
            category_id: importCategory,
            subcategory: importSubcategory === "none" ? null : importSubcategory,
            name: name,
            min_age: minAge && minAge !== '' ? parseInt(minAge) : null,
            max_age: maxAge && maxAge !== '' ? parseInt(maxAge) : null,
            description: description || `${name} ${minAge || 0}-${maxAge || '∞'} anos`,
            is_active: true,
            sort_order: i + 1
          });
        }
      }

      if (ageGroupsToImport.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum escalão válido encontrado nos dados",
          variant: "destructive",
        });
        return;
      }

      // Insert age groups
      const { error } = await supabase
        .from('age_groups')
        .insert(ageGroupsToImport);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${ageGroupsToImport.length} escalões importados com sucesso`,
      });

      setImportData("");
      setImportCategory("");
      setImportSubcategory("none");
      setIsImportDialogOpen(false);
      loadAgeGroups();
    } catch (error) {
      console.error('Error importing age groups:', error);
      toast({
        title: "Erro",
        description: "Erro ao importar escalões",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('age_groups')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Escalão ${!currentStatus ? 'ativado' : 'desativado'}`,
      });
      loadAgeGroups();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar estado do escalão",
        variant: "destructive",
      });
    }
  };

  const filteredAgeGroups = ageGroups.filter(group => {
    // Category filter
    const categoryMatch = selectedCategory === "all" || group.category_id === selectedCategory;
    
    // Subcategory filter
    const subcategoryMatch = selectedSubcategory === "all" || 
      (selectedSubcategory === "none" && !group.subcategory) ||
      group.subcategory === selectedSubcategory;
    
    // Search filter
    const searchMatch = !searchTerm || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (group.subcategory && group.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && subcategoryMatch && searchMatch;
  });

  const categories = getAllCategories();

  // Get subcategories from eventCategories for the selected category (for filters)
  const getAvailableSubcategoriesForFilter = (categoryId: string) => {
    if (categoryId === "all") return [];
    const category = categories.find(cat => cat.id === categoryId);
    return category?.subcategories?.map(sub => sub.name) || [];
  };

  const availableSubcategories = getAvailableSubcategoriesForFilter(selectedCategory);

  // Get subcategories for selected category from eventCategories (for form dropdowns)
  const getSubcategoriesForCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.subcategories || [];
  };

  const selectedCategorySubcategories = getSubcategoriesForCategory(formData.category_id);
  const importCategorySubcategories = getSubcategoriesForCategory(importCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando escalões etários...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestão de Escalões Etários</h1>
              <p className="text-muted-foreground">
                Gerir os escalões sugeridos para todas as categorias desportivas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Importar Escalões por Tabela</DialogTitle>
                  <DialogDescription>
                    Cole os dados da tabela no formato: Nome, Idade Mínima, Idade Máxima, Descrição
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select
                        value={importCategory}
                        onValueChange={(value) => {
                          setImportCategory(value);
                          setImportSubcategory("none"); // Reset subcategory when category changes
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Subcategoria</Label>
                      <Select
                        value={importSubcategory}
                        onValueChange={setImportSubcategory}
                        disabled={!importCategory || importCategorySubcategories.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem subcategoria</SelectItem>
                          {importCategorySubcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.name}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dados da Tabela *</Label>
                    <textarea
                      className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder={`Exemplo:
Sub-7 Masc	5	6	Homem 5-6 anos
Sub-9 Masc	7	8	Homem 7-8 anos
Sub-11 Masc	9	10	Homem 9-10 anos

Ou separado por vírgulas:
Sub-7 Masc,5,6,Homem 5-6 anos
Sub-9 Masc,7,8,Homem 7-8 anos`}
                    />
                    <p className="text-sm text-muted-foreground">
                      Cole os dados da tabela aqui. Pode usar separação por tabs (Excel) ou vírgulas (CSV).
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleImport}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Escalões
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Escalão
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingGroup ? 'Editar Escalão' : 'Novo Escalão'}
                </DialogTitle>
                <DialogDescription>
                  Configure os detalhes do escalão etário
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => {
                        setFormData({ 
                          ...formData, 
                          category_id: value,
                          subcategory: "none" // Reset subcategory when category changes
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategoria</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                      disabled={!formData.category_id || selectedCategorySubcategories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem subcategoria</SelectItem>
                        {selectedCategorySubcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.name}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Sub-21 Masculino"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_age">Idade Mínima</Label>
                    <Input
                      id="min_age"
                      type="number"
                      value={formData.min_age}
                      onChange={(e) => setFormData({ ...formData, min_age: e.target.value })}
                      placeholder="Ex: 18"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_age">Idade Máxima</Label>
                    <Input
                      id="max_age"
                      type="number"
                      value={formData.max_age}
                      onChange={(e) => setFormData({ ...formData, max_age: e.target.value })}
                      placeholder="Ex: 21"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Ordem</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Masculino 18-21 anos"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingGroup ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar escalões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {availableSubcategories.length > 0 && (
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as subcategorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as subcategorias</SelectItem>
                    <SelectItem value="none">Sem subcategoria</SelectItem>
                    {availableSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedSubcategory("all");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
            
            {availableSubcategories.length === 0 && selectedCategory !== "all" && (
              <div className="mt-4 p-3 border rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  ℹ️ Nenhuma subcategoria definida para esta categoria no sistema. 
                  As subcategorias são as mesmas utilizadas na criação de eventos.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Escalões */}
        <Card>
          <CardHeader>
            <CardTitle>Escalões Etários ({filteredAgeGroups.length})</CardTitle>
            <CardDescription>
              Gerir escalões sugeridos para {selectedCategory === "all" ? "todas as categorias" : 
                categories.find(c => c.id === selectedCategory)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAgeGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum escalão encontrado para esta categoria
                </p>
              ) : (
                filteredAgeGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                       <div className="flex items-center gap-3">
                         <h3 className="font-medium">{group.name}</h3>
                         <Badge variant={group.is_active ? "default" : "secondary"}>
                           {group.is_active ? "Ativo" : "Inativo"}
                         </Badge>
                         <Badge variant="outline">
                           {categories.find(c => c.id === group.category_id)?.name}
                         </Badge>
                         {group.subcategory && (
                           <Badge variant="secondary">
                             {group.subcategory}
                           </Badge>
                         )}
                       </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {group.min_age || 0}-{group.max_age || "∞"} anos
                        {group.description && ` • ${group.description}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(group.id, group.is_active)}
                      >
                        {group.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAgeGroups;