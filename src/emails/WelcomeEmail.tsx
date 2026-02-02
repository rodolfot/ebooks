import { Text, Button } from "@react-email/components"
import { BaseLayout } from "./BaseLayout"

export interface WelcomeEmailProps {
  name: string
  appUrl?: string
  couponCode?: string
}

export function WelcomeEmail({ name, appUrl, couponCode }: WelcomeEmailProps) {
  appUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return (
    <BaseLayout preview="Bem-vindo a 筆言葉 Fude kotoba!">
      <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
        Ola, {name}!
      </Text>
      <Text>
        Seja bem-vindo a 筆言葉 Fude kotoba! Estamos felizes em ter voce conosco.
      </Text>
      <Text>
        Explore nossa coleção de e-books de qualidade em diversas categorias como programação, marketing digital, empreendedorismo e muito mais.
      </Text>
      {couponCode && (
        <>
          <Text style={{ fontSize: "16px", fontWeight: "bold", marginTop: "16px" }}>
            Presente de boas-vindas!
          </Text>
          <Text>
            Use o cupom <strong style={{ color: "#E63946", fontSize: "18px" }}>{couponCode}</strong> para ganhar 10% de desconto na sua primeira compra. Válido por 30 dias.
          </Text>
        </>
      )}
      <Button
        href={`${appUrl}/ebooks`}
        style={{
          backgroundColor: "#E63946",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        Explorar E-books
      </Button>
    </BaseLayout>
  )
}
