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
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tags, 
  Save,
  X,
  ArrowLeft,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { getAllCategories, getCategoryById, sportCategories, culturalCategories } from "@/data/eventCategories";
import type { Category, Subcategory } from "@/data/eventCategories";

const AdminCategories = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");

  const [categoryFormData, setCategoryFormData] = useState({
    id: "",
    name: "",
    type: "sport" as 'sport' | 'culture'
  });

  const [subcategoryFormData, setSubcategoryFormData] = useState({
    id: "",
    name: "",
    description: "",
    categoryId: ""
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
    loadCategories();
  }, [user, profile, navigate]);

  const loadCategories = () => {
    // Load categories from the data file
    setCategories(getAllCategories());
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      id: "",
      name: "",
      type: "sport"
    });
    setEditingCategory(null);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryFormData({
      id: "",
      name: "",
      description: "",
      categoryId: ""
    });
    setEditingSubcategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      id: category.id,
      name: category.name,
      type: category.type
    });
    setIsDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory, categoryId: string) => {
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({
      id: subcategory.id,
      name: subcategory.name,
      description: subcategory.description || "",
      categoryId: categoryId
    });
    setIsSubcategoryDialogOpen(true);
  };

  const filteredCategories = categories.filter(category => {
    const typeMatch = selectedCategory === "all" || 
      (selectedCategory === "sport" && category.type === "sport") ||
      (selectedCategory === "culture" && category.type === "culture");
    
    const searchMatch = !searchTerm || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  const handleSaveCategory = () => {
    toast({
      title: "Aviso",
      description: "As categorias são geridas através do ficheiro de configuração. Esta funcionalidade será implementada numa versão futura.",
      variant: "default",
    });
    setIsDialogOpen(false);
    resetCategoryForm();
  };

  const handleSaveSubcategory = () => {
    toast({
      title: "Aviso", 
      description: "As subcategorias são geridas através do ficheiro de configuração. Esta funcionalidade será implementada numa versão futura.",
      variant: "default",
    });
    setIsSubcategoryDialogOpen(false);
    resetSubcategoryForm();
  };

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
              <h1 className="text-3xl font-bold">Gestão de Categorias</h1>
              <p className="text-muted-foreground">
                Configurar categorias e subcategorias desportivas e culturais
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategorias</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar categorias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value="sport">Desportivas</SelectItem>
                      <SelectItem value="culture">Culturais</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Categorias */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Categorias ({filteredCategories.length})</CardTitle>
                    <CardDescription>
                      Gerir categorias {selectedCategory === "all" ? "desportivas e culturais" : 
                        selectedCategory === "sport" ? "desportivas" : "culturais"}
                    </CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetCategoryForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Categoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </DialogTitle>
                        <DialogDescription>
                          Configure os detalhes da categoria
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="id">ID *</Label>
                          <Input
                            id="id"
                            value={categoryFormData.id}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, id: e.target.value })}
                            placeholder="Ex: atletismo"
                            disabled={!!editingCategory}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">Nome *</Label>
                          <Input
                            id="name"
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                            placeholder="Ex: Atletismo"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Tipo *</Label>
                          <Select
                            value={categoryFormData.type}
                            onValueChange={(value: 'sport' | 'culture') => 
                              setCategoryFormData({ ...categoryFormData, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sport">Desportiva</SelectItem>
                              <SelectItem value="culture">Cultural</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveCategory}>
                            <Save className="h-4 w-4 mr-2" />
                            {editingCategory ? 'Atualizar' : 'Criar'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCategories.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma categoria encontrada
                    </p>
                  ) : (
                    filteredCategories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{category.name}</h3>
                            <Badge variant={category.type === 'sport' ? "default" : "secondary"}>
                              {category.type === 'sport' ? 'Desportiva' : 'Cultural'}
                            </Badge>
                            <Badge variant="outline">
                              {category.subcategories?.length || 0} subcategorias
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            ID: {category.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subcategories" className="space-y-6">
            {/* Lista de Subcategorias */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Subcategorias</CardTitle>
                    <CardDescription>
                      Gerir subcategorias por categoria
                    </CardDescription>
                  </div>
                  <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetSubcategoryForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Subcategoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingSubcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
                        </DialogTitle>
                        <DialogDescription>
                          Configure os detalhes da subcategoria
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoryId">Categoria *</Label>
                          <Select
                            value={subcategoryFormData.categoryId}
                            onValueChange={(value) => 
                              setSubcategoryFormData({ ...subcategoryFormData, categoryId: value })}
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
                          <Label htmlFor="subId">ID *</Label>
                          <Input
                            id="subId"
                            value={subcategoryFormData.id}
                            onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, id: e.target.value })}
                            placeholder="Ex: estrada"
                            disabled={!!editingSubcategory}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subName">Nome *</Label>
                          <Input
                            id="subName"
                            value={subcategoryFormData.name}
                            onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                            placeholder="Ex: Corridas de Estrada"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subDescription">Descrição</Label>
                          <Textarea
                            id="subDescription"
                            value={subcategoryFormData.description}
                            onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                            placeholder="Ex: Corridas de estrada (5km, 10km, meia maratona, maratona)"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveSubcategory}>
                            <Save className="h-4 w-4 mr-2" />
                            {editingSubcategory ? 'Atualizar' : 'Criar'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categories.map((category) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <Badge variant={category.type === 'sport' ? "default" : "secondary"}>
                          {category.type === 'sport' ? 'Desportiva' : 'Cultural'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {category.subcategories && category.subcategories.length > 0 ? (
                          category.subcategories.map((subcategory) => (
                            <div key={subcategory.id} className="flex items-center justify-between p-3 border rounded bg-muted/20">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{subcategory.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {subcategory.id}
                                  </Badge>
                                </div>
                                {subcategory.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {subcategory.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSubcategory(subcategory, category.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            Nenhuma subcategoria definida
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCategories;