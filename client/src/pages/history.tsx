import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Clock, Calendar, FileText, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import type { CallLog } from "@shared/schema";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function History() {
  const { data: callLogs = [], isLoading } = useQuery<CallLog[]>({
    queryKey: ["/api/calls"],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Call History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage your past calls
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {callLogs.length} calls
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full mx-auto mb-2"
              />
              Loading calls...
            </div>
          ) : callLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Phone className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No calls yet</p>
              <p className="text-sm mt-1 text-muted-foreground/70">
                Start a call from the home page
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-border">
                {callLogs.map((call, index) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover-elevate cursor-pointer"
                    data-testid={`row-call-${call.id}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              AI Assistant Call
                            </span>
                            <Badge
                              variant={call.status === "completed" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {call.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(call.startedAt), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDistanceToNow(new Date(call.startedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-medium text-foreground tabular-nums">
                            {formatDuration(call.duration)}
                          </div>
                          <div className="text-xs text-muted-foreground">duration</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {call.transcript && (
                            <button
                              className="p-2 rounded-md hover-elevate text-muted-foreground hover:text-foreground transition-colors"
                              title="View transcript"
                              data-testid={`button-transcript-${call.id}`}
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          {call.recordingUrl && (
                            <button
                              className="p-2 rounded-md hover-elevate text-muted-foreground hover:text-primary transition-colors"
                              title="Play recording"
                              data-testid={`button-play-${call.id}`}
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
