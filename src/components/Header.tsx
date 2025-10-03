import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, User, ShoppingCart, LogOut, Settings, BarChart3, Plus, Calendar, MapPin, Tag, Users, BookOpen, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import logoInscrix from "@/assets/logo-inscrix.png";
import LanguageSelector from "@/components/LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!profile?.role) return "/dashboard";
    
    switch (profile.role) {
      case 'admin':
        return "/admin";
      case 'organizer':
        return "/organizer-dashboard";
      case 'participant':
      case 'team':
        return "/participant-dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={logoInscrix} 
              alt="INSCRIX – Gestão e Organização de Eventos" 
              className="h-12 w-auto drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
            />
          </Link>
        </div>

        {/* Central navigation buttons */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button asChild variant="ghost" className="text-xs font-medium">
            <Link to="/eventos">{t('navigation.events')}</Link>
          </Button>
          <Button asChild variant="ghost" className="text-xs font-medium">
            <Link to="/categorias">{t('navigation.categorias')}</Link>
          </Button>
          <Button asChild variant="ghost" className="text-xs font-medium">
            <Link to="/localizacao">{t('navigation.localization')}</Link>
          </Button>
        </nav>

        {/* Right side items - desktop and mobile aligned */}
        <div className="flex items-center space-x-2 h-12">
          <LanguageSelector />
          
          <Button asChild variant="outline" className="hidden md:flex">
            <Link to="/create-event">
              {t('events.createEvent')}
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="hidden md:flex relative">
            <Link to="/cart">
              <ShoppingCart className="h-4 w-4" />
              {getItemCount() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {getItemCount()}
                </Badge>
              )}
            </Link>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {profile?.first_name || 'Utilizador'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={getDashboardLink()} className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t('navigation.dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {t('navigation.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("navigation.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <User className="h-4 w-4" />
                {t('auth.login')}
              </Link>
            </Button>
          )}

          {/* Mobile menu trigger - aligned right */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-12 w-12 flex items-center justify-center"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={logoInscrix} 
                      alt="INSCRIX" 
                      className="h-8 w-auto"
                    />
                    <div>
                      <h2 className="font-semibold text-lg">{t('settings.nmcompany')}</h2>
                      <p className="text-xs text-muted-foreground">{t('settings.peventmanage')}</p>
                    </div>
                  </div>
                </div>

                {/* User Section */}
                <div className="p-6 border-b">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{profile?.first_name || 'Utilizador'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <Link to={getDashboardLink()}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            {t('navigation.dashboard')}
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/profile">
                            <Settings className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{t("auth.loginto")}</p>
                      <Button asChild className="w-full">
                        <Link to="/login">
                          <User className="mr-2 h-4 w-4" />
                          {t('auth.login')}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Main Navigation */}
                <div className="flex-1 p-6 space-y-6">
                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t('sidebar.quickActions.title')}</h3>
                    <div className="space-y-1">
                      <Button asChild variant="ghost" className="w-full justify-start h-12">
                        <Link to="/create-event">
                          <Plus className="mr-3 h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-medium">{t('events.createEvent')}</div>
                            <div className="text-xs text-muted-foreground">{t('sidebar.quickActions.createEvent.description')}</div>
                          </div>
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full justify-start h-12 relative">
                        <Link to="/cart">
                          <ShoppingCart className="mr-3 h-5 w-5 text-primary" />
                          <div className="text-left flex-1">
                            <div className="font-medium">{t('navigation.cart')}</div>
                            <div className="text-xs text-muted-foreground">{t('sidebar.quickActions.cart.description')}</div>
                          </div>
                          {getItemCount() > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                              {getItemCount()}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Main Navigation */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t('sidebar.explore.title')}</h3>
                    <div className="space-y-1">
                      <Button asChild variant="ghost" className="w-full justify-start h-12">
                        <Link to="/eventos">
                          <Calendar className="mr-3 h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-medium">{t('sidebar.explore.events.label')}</div>
                            <div className="text-xs text-muted-foreground">{t('sidebar.explore.events.description')}</div>
                          </div>
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full justify-start h-12">
                        <Link to="/categorias">
                          <Tag className="mr-3 h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-medium">{t('sidebar.explore.categories.label')}</div>
                            <div className="text-xs text-muted-foreground">{t('sidebar.explore.categories.description')}</div>
                          </div>
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full justify-start h-12">
                        <Link to="/localizacao">
                          <MapPin className="mr-3 h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-medium">{t('sidebar.explore.location.label')}</div>
                            <div className="text-xs text-muted-foreground">{t('sidebar.explore.location.description')}</div>
                          </div>
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full justify-start h-12">
                        <Link to="/manual">
                          <BookOpen className="mr-3 h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-medium">{t('sidebar.explore.manual.label')}</div>
                            <div className="text-xs text-muted-foreground">{t('sidebar.explore.manual.description')}</div>
                          </div>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t space-y-4">
                  <div className="flex justify-center">
                    <LanguageSelector />
                  </div>
                  
                  {user && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('auth.logout')}
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
