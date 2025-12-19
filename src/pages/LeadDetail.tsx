import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Lead, Recording, Analysis } from "@/lib/supabase";
import { ArrowLeft, User, Mail, Phone, FileText, Play, Clock, Activity, TrendingUp, Loader2 } from "lucide-react";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [recordings, setRecordings] = useState<(Recording & { analyses?: Analysis })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeadAndRecordings = async () => {
      if (!id || !user) return;

      try {
        // Fetch lead details
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', id)
          .single();

        if (leadError) throw leadError;
        setLead(leadData);

        // Fetch recordings for this lead
        const { data: recordingsData, error: recordingsError } = await supabase
          .from('recordings')
          .select('*')
          .eq('lead_id', id)
          .order('created_at', { ascending: false });

        if (recordingsError) throw recordingsError;

        // Fetch analyses for these recordings
        if (recordingsData && recordingsData.length > 0) {
          const recordingIds = recordingsData.map(r => r.id);
          const { data: analysesData } = await supabase
            .from('analyses')
            .select('*')
            .in('recording_id', recordingIds);

          // Merge analyses with recordings
          const recordingsWithAnalyses = recordingsData.map(recording => ({
            ...recording,
            analyses: analysesData?.find(a => a.recording_id === recording.id)
          }));

          setRecordings(recordingsWithAnalyses);
        } else {
          setRecordings([]);
        }
      } catch (error) {
        console.error('Error fetching lead data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadAndRecordings();
  }, [id, user]);

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">No Analysis</Badge>;
    
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>;
      case "processing":
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
      case "failed":
        return <Badge className="bg-rose-100 text-rose-700">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSentimentColor = (score?: number) => {
    if (!score) return "text-slate-600";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-rose-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Lead Not Found</h1>
          <Button onClick={() => navigate('/?view=dashboard&tab=leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/?view=dashboard&tab=leads')}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leads
              </Button>
              <div className="h-8 w-px bg-slate-300" />
              <img 
                src="/panchsil_logo.png.jpg" 
                alt="Panchshil" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {lead.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                  {lead.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </span>
                  )}
                  {lead.contact && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {lead.contact}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
              {recordings.length} Recording{recordings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Lead Info Card */}
        {lead.description && (
          <Card className="mb-6 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{lead.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Recordings Section */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Call Recordings
            </CardTitle>
            <CardDescription>
              All recordings associated with this lead
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recordings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Recordings Yet</h3>
                <p className="text-slate-600 mb-4">No call recordings have been associated with this lead.</p>
                <Button onClick={() => navigate('/?view=dashboard&tab=recordings')}>
                  Add Recording
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recordings.map((recording) => {
                  const analysis = recording.analyses;
                  return (
                    <div 
                      key={recording.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (analysis && analysis.status?.toLowerCase() === 'completed') {
                          navigate(`/analysis/${analysis.id}?from=lead&leadId=${id}`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Play className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{recording.file_name || 'Unnamed Recording'}</h4>
                          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(recording.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {recording.duration_seconds && (
                              <span className="ml-2">
                                • {Math.floor(recording.duration_seconds / 60)}:{(recording.duration_seconds % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        {analysis ? (
                          <>
                            {analysis.sentiments_score !== null && analysis.sentiments_score !== undefined && (
                              <div className="text-center">
                                <p className="text-xs text-slate-600 mb-1">Sentiment</p>
                                <p className={`font-semibold ${getSentimentColor(analysis.sentiments_score)}`}>
                                  {analysis.sentiments_score}%
                                </p>
                              </div>
                            )}
                            {analysis.engagement_score !== null && analysis.engagement_score !== undefined && (
                              <div className="text-center">
                                <p className="text-xs text-slate-600 mb-1">Engagement</p>
                                <p className={`font-semibold ${getSentimentColor(analysis.engagement_score)}`}>
                                  {analysis.engagement_score}%
                                </p>
                              </div>
                            )}
                            {getStatusBadge(analysis.status)}
                          </>
                        ) : (
                          <Badge variant="secondary">No Analysis</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
