import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QrCode, Search, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export function LandingPage() {
  const [assetCode, setAssetCode] = useState('');
  const navigate = useNavigate();

  const goToAsset = (e) => {
    e.preventDefault();
    if (assetCode.trim()) navigate(`/assets/public/${assetCode.trim().toUpperCase()}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          M
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">MaintainIQ</h1>
        <p className="mt-1 text-sm text-muted-foreground">Scan. Report. Diagnose. Maintain.</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4" /> Find your asset
          </CardTitle>
          <CardDescription>Scanned a QR code? Or enter the asset code printed on the label.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={goToAsset} className="flex gap-2">
            <Input
              placeholder="AST-A1B2C3"
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              className="font-mono uppercase"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            <Link to="/track" className="hover:underline">Check a reported issue's status</Link>
          </p>
        </CardContent>
      </Card>

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ShieldCheck className="h-3.5 w-3.5" /> Staff sign in
      </Link>
    </div>
  );
}
