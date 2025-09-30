import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getAllCategories, 
  getCategoriesByType, 
  Category, 
  Subcategory, 
  AgeGroup, 
  GenderCategory,
  standardAgeGroups,
  genderCategories 
} from "@/data/eventCategories";

interface CategorySelectorProps {
  selectedCategory?: string;
  selectedSubcategories?: string[];
  selectedAgeGroups?: string[];
  selectedGenderCategories?: string[];
  eventType?: 'sport' | 'culture' | 'all';
  onCategoryChange?: (categoryId: string) => void;
  onSubcategoriesChange?: (subcategoryIds: string[]) => void;
  onAgeGroupsChange?: (ageGroupIds: string[]) => void;
  onGenderCategoriesChange?: (genderCategoryIds: string[]) => void;
  showAgeGroups?: boolean;
  showGenderCategories?: boolean;
  showSubcategories?: boolean;
}

export const CategorySelector = ({
  selectedCategory,
  selectedSubcategories = [],
  selectedAgeGroups = [],
  selectedGenderCategories = [],
  eventType = 'all',
  onCategoryChange,
  onSubcategoriesChange,
  onAgeGroupsChange,
  onGenderCategoriesChange,
  showAgeGroups = true,
  showGenderCategories = true,
  showSubcategories = true
}: CategorySelectorProps) => {
  const [activeTab, setActiveTab] = useState<'sport' | 'culture'>('sport');
  
  const categories = eventType === 'all' ? getAllCategories() : getCategoriesByType(eventType);
  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
    if (!onSubcategoriesChange) return;
    
    if (checked) {
      onSubcategoriesChange([...selectedSubcategories, subcategoryId]);
    } else {
      onSubcategoriesChange(selectedSubcategories.filter(id => id !== subcategoryId));
    }
  };

  const handleAgeGroupChange = (ageGroupId: string, checked: boolean) => {
    if (!onAgeGroupsChange) return;
    
    if (checked) {
      onAgeGroupsChange([...selectedAgeGroups, ageGroupId]);
    } else {
      onAgeGroupsChange(selectedAgeGroups.filter(id => id !== ageGroupId));
    }
  };

  const handleGenderCategoryChange = (genderCategoryId: string, checked: boolean) => {
    if (!onGenderCategoriesChange) return;
    
    if (checked) {
      onGenderCategoriesChange([...selectedGenderCategories, genderCategoryId]);
    } else {
      onGenderCategoriesChange(selectedGenderCategories.filter(id => id !== genderCategoryId));
    }
  };

  const renderCategorySelector = (categoryList: Category[]) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Modalidade/Categoria Principal</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categoryList.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentCategory && showSubcategories && currentCategory.subcategories && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subcategorias de {currentCategory.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentCategory.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={subcategory.id}
                    checked={selectedSubcategories.includes(subcategory.id)}
                    onCheckedChange={(checked) => 
                      handleSubcategoryChange(subcategory.id, checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={subcategory.id} className="text-sm font-medium">
                      {subcategory.name}
                    </Label>
                    {subcategory.description && (
                      <p className="text-xs text-muted-foreground">
                        {subcategory.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentCategory && showAgeGroups && currentCategory.type === 'sport' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Escalões Etários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {(currentCategory.ageGroups || standardAgeGroups).map((ageGroup) => (
                <div key={ageGroup.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={ageGroup.id}
                    checked={selectedAgeGroups.includes(ageGroup.id)}
                    onCheckedChange={(checked) => 
                      handleAgeGroupChange(ageGroup.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={ageGroup.id} className="text-sm">
                    {ageGroup.name} ({ageGroup.description})
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentCategory && showGenderCategories && currentCategory.type === 'sport' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorias de Género</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(currentCategory.genderCategories || genderCategories).map((genderCategory) => (
                <div key={genderCategory.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={genderCategory.id}
                    checked={selectedGenderCategories.includes(genderCategory.id)}
                    onCheckedChange={(checked) => 
                      handleGenderCategoryChange(genderCategory.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={genderCategory.id} className="text-sm">
                    {genderCategory.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (eventType !== 'all') {
    return renderCategorySelector(categories);
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'sport' | 'culture')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sport">Desporto</TabsTrigger>
        <TabsTrigger value="culture">Cultura</TabsTrigger>
      </TabsList>
      
      <TabsContent value="sport" className="mt-6">
        {renderCategorySelector(getCategoriesByType('sport'))}
      </TabsContent>
      
      <TabsContent value="culture" className="mt-6">
        {renderCategorySelector(getCategoriesByType('culture'))}
      </TabsContent>
    </Tabs>
  );
};

export default CategorySelector;