import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Bot, Key, Server, RefreshCw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || "";
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || "";

export default function Admin() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your VAPI assistant settings and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Assistant Configuration
              </CardTitle>
              <CardDescription>
                VAPI assistant settings and connection status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span className="font-medium text-foreground">Connected</span>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Assistant ID
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Input
                      value={VAPI_ASSISTANT_ID}
                      readOnly
                      className="font-mono text-sm bg-muted/50"
                      data-testid="input-assistant-id"
                    />
                    <Button size="icon" variant="outline" title="Copy">
                      <Key className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Public Key
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Input
                      value={VAPI_PUBLIC_KEY}
                      readOnly
                      className="font-mono text-sm bg-muted/50"
                      data-testid="input-public-key"
                    />
                    <Button size="icon" variant="outline" title="Copy">
                      <Key className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                System Status
              </CardTitle>
              <CardDescription>
                Backend services and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Server className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">API Server</div>
                      <div className="text-xs text-muted-foreground">Express.js</div>
                    </div>
                  </div>
                  <Badge variant="default">Running</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">VAPI Integration</div>
                      <div className="text-xs text-muted-foreground">Voice AI Engine</div>
                    </div>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">Database</div>
                      <div className="text-xs text-muted-foreground">PostgreSQL (Neon)</div>
                    </div>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  data-testid="button-refresh-connection"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh Connection</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <a
                    href="https://dashboard.vapi.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-vapi-dashboard"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>VAPI Dashboard</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  data-testid="button-test-call"
                >
                  <Bot className="w-5 h-5" />
                  <span>Test Assistant</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
