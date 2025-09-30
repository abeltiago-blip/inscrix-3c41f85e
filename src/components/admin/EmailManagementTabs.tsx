import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Settings, 
  Send, 
  TestTube, 
  FileText, 
  Activity 
} from "lucide-react";
import EmailDashboard from "./EmailDashboard";
import EmailTemplateManager from "./EmailTemplateManager";
import EmailManager from "../EmailManager";
import EmailConfigurationPanel from "./EmailConfigurationPanel";
import EmailTestSuite from "./EmailTestSuite";
import EmailLogsViewer from "./EmailLogsViewer";

const EmailManagementTabs = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Send className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Emails</h2>
          <p className="text-muted-foreground">
            Centro de comando completo para toda a comunicação por email da plataforma
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Modelos
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviar
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testes
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <EmailDashboard />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gestão de Modelos de Email
              </CardTitle>
            <CardDescription>
              Criem, editem e geriram todos os modelos de email da plataforma
            </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailTemplateManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Envio de Emails
              </CardTitle>
              <CardDescription>
                Enviem emails individuais, lembretes de eventos e campanhas em lote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <EmailConfigurationPanel />
        </TabsContent>

        <TabsContent value="tests" className="mt-6">
          <EmailTestSuite />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <EmailLogsViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManagementTabs;