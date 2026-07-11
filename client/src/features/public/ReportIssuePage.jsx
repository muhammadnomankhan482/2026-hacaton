import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, CheckCircle2, TriangleAlert, ArrowLeft } from 'lucide-react';
import { issueApi } from '../../api/issueApi';
import { useToast } from '../../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PRIORITY } from '../../lib/constants';

const AI_ERROR_MESSAGES = {
  AI_TIMEOUT: 'AI triage timed out. You can still fill in the details manually below.',
  AI_UNAVAILABLE: 'AI triage is temporarily unavailable. Please enter the details manually.',
  AI_INVALID_OUTPUT: "AI couldn't produce a valid suggestion. Please enter the details manually.",
  AI_NOT_CONFIGURED: 'AI triage is not configured for this deployment. Please enter the details manually.',
};

export function ReportIssuePage() {
  const { assetCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [complaint, setComplaint] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState(PRIORITY.MEDIUM);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [submitted, setSubmitted] = useState(null);

  const triageMutation = useMutation({
    mutationFn: () => issueApi.previewAiTriage({ assetCode, complaint }),
    onSuccess: (suggestion) => {
      setAiSuggestion(suggestion);
      setAiError(null);
      setTitle(suggestion.title);
      setCategory(suggestion.category);
      setPriority(suggestion.priority);
    },
    onError: (err) => {
      setAiError(AI_ERROR_MESSAGES[err.code] || 'AI triage failed. Please enter the details manually.');
    },
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      issueApi.create({
        assetCode,
        title: title || complaint.slice(0, 80),
        description: complaint,
        category,
        priority,
        reporterName,
        reporterContact,
        evidence,
        aiSuggestion: aiSuggestion || undefined,
      }),
    onSuccess: (issue) => setSubmitted(issue),
    onError: (err) => toast({ title: 'Could not submit issue', description: err.message, variant: 'error' }),
  });

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h1 className="text-lg font-semibold">Issue reported</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your issue number is <span className="font-mono font-semibold">{submitted.issueNumber}</span>. Save it to check
          the status later.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/assets/public/${assetCode}`)}>
            Back to asset page
          </Button>
          <Button asChild>
            <Link to="/track">Track this issue</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link to={`/assets/public/${assetCode}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to asset
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Report an Issue</CardTitle>
            <CardDescription>Asset {assetCode}. Describe the problem in your own words.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>What's wrong?</Label>
              <Textarea
                rows={4}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="e.g. The projector display is flickering and sometimes does not detect HDMI."
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!complaint.trim() || triageMutation.isPending}
              onClick={() => triageMutation.mutate()}
            >
              <Sparkles className="h-4 w-4" />
              {triageMutation.isPending ? 'Analyzing…' : 'Get AI Suggestion'}
            </Button>

            {aiError && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {aiError}
              </div>
            )}

            {aiSuggestion && (
              <div className="space-y-2 rounded-md border bg-accent/40 p-3 text-xs">
                <p className="font-medium">AI Suggestion (review and edit below)</p>
                {aiSuggestion.possibleCauses?.length > 0 && (
                  <p>
                    <span className="font-medium">Possible causes: </span>
                    {aiSuggestion.possibleCauses.join(', ')}
                  </p>
                )}
                {aiSuggestion.initialChecks?.length > 0 && (
                  <p>
                    <span className="font-medium">Initial checks: </span>
                    {aiSuggestion.initialChecks.join('; ')}
                  </p>
                )}
                {aiSuggestion.recurringPatternWarning && (
                  <p className="flex items-center gap-1 font-medium text-destructive">
                    <TriangleAlert className="h-3.5 w-3.5" /> {aiSuggestion.recurringPatternWarning}
                  </p>
                )}
                <p className="text-muted-foreground">
                  This is advisory only — a technician will confirm the actual cause. For anything involving live wiring,
                  gas, fire, or structural damage, stop using the asset and wait for a qualified technician.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short issue title" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PRIORITY).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Your name (optional)</Label>
                <Input value={reporterName} onChange={(e) => setReporterName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Contact (optional)</Label>
                <Input value={reporterContact} onChange={(e) => setReporterContact(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Photo/video evidence (optional)</Label>
              <Input type="file" multiple accept="image/*,video/*" onChange={(e) => setEvidence(Array.from(e.target.files))} />
              {evidence.length > 0 && <Badge variant="secondary">{evidence.length} file(s) selected</Badge>}
            </div>

            <Button
              className="w-full"
              disabled={!complaint.trim() || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit Issue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
