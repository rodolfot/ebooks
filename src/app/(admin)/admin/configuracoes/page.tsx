import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import { logPageView } from "@/lib/log-page-view"

export const metadata = { title: "Admin - Configuracoes" }

function EnvStatus({ name, configured }: { name: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{name}</span>
      {configured ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
          <CheckCircle className="h-3 w-3" /> Configurado
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
          <XCircle className="h-3 w-3" /> Pendente
        </Badge>
      )}
    </div>
  )
}

export default function AdminSettingsPage() {
  logPageView("Configuracoes", "/admin/configuracoes")
  const services = [
    { name: "Banco de Dados (PostgreSQL)", configured: !!process.env.DATABASE_URL },
    { name: "NextAuth Secret", configured: !!process.env.AUTH_SECRET },
    { name: "Google OAuth", configured: !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET },
    { name: "AWS S3 (Armazenamento)", configured: !!process.env.AWS_S3_BUCKET && !!process.env.AWS_ACCESS_KEY_ID },
    { name: "AWS CloudFront (CDN)", configured: !!process.env.AWS_CLOUDFRONT_DOMAIN },
    { name: "Mercado Pago", configured: !!process.env.MERCADO_PAGO_ACCESS_TOKEN },
    { name: "Coinbase Commerce", configured: !!process.env.COINBASE_API_KEY },
    { name: "Resend (Email)", configured: !!process.env.RESEND_API_KEY },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Configuracoes</h1>

      <Card>
        <CardHeader><CardTitle>Status dos Servicos</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {services.map((s) => (
            <EnvStatus key={s.name} name={s.name} configured={s.configured} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Configuracoes da Loja</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            As configuracoes da loja sao gerenciadas atraves das variaveis de ambiente (.env).
            Altere as credenciais dos gateways de pagamento, servicos de email e armazenamento diretamente no arquivo .env.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Modo de Teste</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para testes, utilize o cupom <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono">GRATIS100</code> para
            simular compras gratuitas. Os gateways de pagamento devem ser configurados em modo sandbox
            para testes com transacoes reais.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
