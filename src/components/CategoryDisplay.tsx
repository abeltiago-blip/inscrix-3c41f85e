import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getCategoryById, 
  getSubcategoryById, 
  standardAgeGroups, 
  genderCategories,
  Category 
} from "@/data/eventCategories";

interface CategoryDisplayProps {
  categoryId: string;
  subcategoryIds?: string[];
  ageGroupIds?: string[];
  genderCategoryIds?: string[];
  showDescription?: boolean;
  layout?: 'horizontal' | 'vertical' | 'compact';
}

export const CategoryDisplay = ({
  categoryId,
  subcategoryIds = [],
  ageGroupIds = [],
  genderCategoryIds = [],
  showDescription = true,
  layout = 'horizontal'
}: CategoryDisplayProps) => {
  const category = getCategoryById(categoryId);
  
  if (!category) {
    return null;
  }

  const subcategories = subcategoryIds
    .map(id => getSubcategoryById(categoryId, id))
    .filter(Boolean);

  const ageGroups = ageGroupIds
    .map(id => standardAgeGroups.find(ag => ag.id === id))
    .filter(Boolean);

  const genderCats = genderCategoryIds
    .map(id => genderCategories.find(gc => gc.id === id))
    .filter(Boolean);

  if (layout === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        <Badge variant="default" className="bg-primary">
          {category.name}
        </Badge>
        {subcategories.map(sub => (
          <Badge key={sub!.id} variant="secondary">
            {sub!.name}
          </Badge>
        ))}
        {ageGroups.map(age => (
          <Badge key={age!.id} variant="outline">
            {age!.name}
          </Badge>
        ))}
        {genderCats.map(gender => (
          <Badge key={gender!.id} variant="outline">
            {gender!.name}
          </Badge>
        ))}
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="default">{category.type === 'sport' ? 'Desporto' : 'Cultura'}</Badge>
            {category.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subcategories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Subcategorias:</h4>
              <div className="flex flex-wrap gap-1">
                {subcategories.map(sub => (
                  <Badge key={sub!.id} variant="secondary" className="text-xs">
                    {sub!.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {ageGroups.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Escalões Etários:</h4>
              <div className="flex flex-wrap gap-1">
                {ageGroups.map(age => (
                  <Badge key={age!.id} variant="outline" className="text-xs">
                    {age!.name} ({age!.description})
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {genderCats.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Categorias de Género:</h4>
              <div className="flex flex-wrap gap-1">
                {genderCats.map(gender => (
                  <Badge key={gender!.id} variant="outline" className="text-xs">
                    {gender!.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Layout horizontal (default)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-primary">
          {category.name}
        </Badge>
        <Badge variant="outline">
          {category.type === 'sport' ? 'Desporto' : 'Cultura'}
        </Badge>
      </div>
      
      {subcategories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Subcategorias:</h4>
          <div className="flex flex-wrap gap-2">
            {subcategories.map(sub => (
              <div key={sub!.id} className="space-y-1">
                <Badge variant="secondary">{sub!.name}</Badge>
                {showDescription && sub!.description && (
                  <p className="text-xs text-muted-foreground max-w-xs">
                    {sub!.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {(ageGroups.length > 0 || genderCats.length > 0) && (
        <div className="flex flex-wrap gap-4">
          {ageGroups.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Escalões:</h4>
              <div className="flex flex-wrap gap-1">
                {ageGroups.map(age => (
                  <Badge key={age!.id} variant="outline" className="text-xs">
                    {age!.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {genderCats.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Género:</h4>
              <div className="flex flex-wrap gap-1">
                {genderCats.map(gender => (
                  <Badge key={gender!.id} variant="outline" className="text-xs">
                    {gender!.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDisplay;