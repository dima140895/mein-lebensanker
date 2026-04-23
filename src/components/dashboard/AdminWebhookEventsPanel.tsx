import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCcw, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface WebhookEvent {
  id: string;
  stripe_event_id: string | null;
  event_type: string;
  user_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_plan: string | null;
  new_plan: string | null;
  previous_active_modules: string[] | null;
  new_active_modules: string[] | null;
  notes: string | null;
  created_at: string;
}

interface ApiResponse {
  target: {
    user_id: string | null;
    email: string | null;
    subscription: {
      status?: string;
      plan?: string;
      active_modules?: string[];
      max_profiles?: number;
      current_period_end?: string | null;
      stripe_customer_id?: string | null;
      stripe_subscription_id?: string | null;
    } | null;
  };
  events: WebhookEvent[];
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const ModuleDiff = ({ before, after }: { before: string[] | null; after: string[] | null }) => {
  const beforeSet = new Set(before ?? []);
  const afterSet = new Set(after ?? []);
  const removed = (before ?? []).filter((m) => !afterSet.has(m));
  const added = (after ?? []).filter((m) => !beforeSet.has(m));
  const unchanged = (after ?? []).filter((m) => beforeSet.has(m));

  return (
    <div className="flex flex-wrap gap-1.5">
      {unchanged.map((m) => (
        <Badge key={`u-${m}`} variant="secondary" className="text-[11px] font-mono">
          {m}
        </Badge>
      ))}
      {added.map((m) => (
        <Badge key={`a-${m}`} className="text-[11px] font-mono bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
          + {m}
        </Badge>
      ))}
      {removed.map((m) => (
        <Badge key={`r-${m}`} className="text-[11px] font-mono bg-rose-100 text-rose-900 hover:bg-rose-100 line-through">
          − {m}
        </Badge>
      ))}
      {!unchanged.length && !added.length && !removed.length && (
        <span className="text-xs text-muted-foreground italic">— keine Daten —</span>
      )}
    </div>
  );
};

const AdminWebhookEventsPanel = () => {
  const { isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Dieses Panel ist nur für Administratoren sichtbar.
      </div>
    );
  }

  const fetchEvents = async (overrideEmail?: string) => {
    const target = (overrideEmail ?? email).trim();
    if (!target) {
      toast.error('Bitte eine E-Mail-Adresse eingeben.');
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const { data: result, error } = await supabase.functions.invoke<ApiResponse>(
        'admin-webhook-events',
        { body: { email: target, limit: 20 } }
      );
      if (error) throw error;
      setData(result ?? null);
      if (!result?.target?.user_id) {
        toast.warning('Kein Nutzer mit dieser E-Mail gefunden.');
      } else if ((result?.events?.length ?? 0) === 0) {
        toast.info('Keine Webhook-Events für diesen Nutzer gespeichert.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Abruf fehlgeschlagen: ${msg}`);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const sub = data?.target.subscription;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-primary/5 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm text-foreground">
          <p className="font-medium">Internes Debug-Panel</p>
          <p className="text-muted-foreground mt-1">
            Zeigt die letzten Stripe-Webhook-Events für ein Nutzerkonto und die daraus resultierenden
            Änderungen an <code className="text-xs bg-background px-1 py-0.5 rounded">active_modules</code>{' '}
            und Plan. Nur Admins haben Zugriff.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <label className="text-sm font-medium text-foreground">Nutzer-E-Mail</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="z. B. nutzer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchEvents();
            }}
            className="flex-1"
          />
          <Button onClick={() => fetchEvents()} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Suchen
          </Button>
          {hasSearched && (
            <Button variant="outline" onClick={() => fetchEvents()} disabled={loading} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Aktualisieren
            </Button>
          )}
        </div>
      </div>

      {data?.target.user_id && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Aktueller Zustand</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">E-Mail</dt>
              <dd className="font-mono text-xs">{data.target.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">User-ID</dt>
              <dd className="font-mono text-xs break-all">{data.target.user_id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant="outline">{sub?.status ?? '—'}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Plan</dt>
              <dd>
                <Badge variant="outline">{sub?.plan ?? '—'}</Badge>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground mb-1">Aktive Module</dt>
              <dd className="flex flex-wrap gap-1.5">
                {(sub?.active_modules ?? []).map((m) => (
                  <Badge key={m} variant="secondary" className="text-[11px] font-mono">
                    {m}
                  </Badge>
                ))}
                {!sub?.active_modules?.length && (
                  <span className="text-xs text-muted-foreground italic">— keine —</span>
                )}
              </dd>
            </div>
            {sub?.current_period_end && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Laufzeit-Ende</dt>
                <dd className="text-xs">{formatDate(sub.current_period_end)}</dd>
              </div>
            )}
            {sub?.stripe_customer_id && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Stripe Customer / Subscription</dt>
                <dd className="font-mono text-xs break-all">
                  {sub.stripe_customer_id} / {sub.stripe_subscription_id ?? '—'}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {hasSearched && !loading && data && (data.events?.length ?? 0) === 0 && (
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Keine Webhook-Events für diesen Nutzer gespeichert.
        </div>
      )}

      {data && data.events.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Letzte Events ({data.events.length})</h3>
          {data.events.map((ev) => (
            <div key={ev.id} className="rounded-2xl border bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="font-mono text-[11px] bg-foreground text-background hover:bg-foreground">
                    {ev.event_type}
                  </Badge>
                  {ev.previous_status !== ev.new_status && (
                    <span className="text-xs text-muted-foreground">
                      Status: <span className="font-mono">{ev.previous_status ?? '—'}</span>{' '}
                      → <span className="font-mono">{ev.new_status ?? '—'}</span>
                    </span>
                  )}
                  {ev.previous_plan !== ev.new_plan && (
                    <span className="text-xs text-muted-foreground">
                      Plan: <span className="font-mono">{ev.previous_plan ?? '—'}</span>{' '}
                      → <span className="font-mono">{ev.new_plan ?? '—'}</span>
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(ev.created_at)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Vorher (active_modules)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(ev.previous_active_modules ?? []).map((m) => (
                      <Badge key={`p-${ev.id}-${m}`} variant="outline" className="text-[11px] font-mono">
                        {m}
                      </Badge>
                    ))}
                    {!ev.previous_active_modules?.length && (
                      <span className="text-xs text-muted-foreground italic">— leer —</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nachher (mit Diff)</p>
                  <ModuleDiff before={ev.previous_active_modules} after={ev.new_active_modules} />
                </div>
              </div>

              {ev.notes && (
                <p className="text-xs text-muted-foreground italic border-t pt-2">{ev.notes}</p>
              )}

              {(ev.stripe_event_id || ev.stripe_subscription_id) && (
                <div className="text-[11px] text-muted-foreground font-mono break-all space-y-0.5 border-t pt-2">
                  {ev.stripe_event_id && <div>event_id: {ev.stripe_event_id}</div>}
                  {ev.stripe_subscription_id && <div>sub_id: {ev.stripe_subscription_id}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminWebhookEventsPanel;
