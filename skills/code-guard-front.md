# 🧠 React Code Review Guide (Tailwind + shadcn/ui + TypeScript Moderno)

Checklist completo para revisão de projetos React focados no stack **Tailwind CSS**, **shadcn/ui** e **TypeScript Moderno**. Focado em manutenibilidade, design system consistente e tipagem segura.

---

# 🎨 1. Estilização: Tailwind CSS & shadcn/ui

### ✅ Cores Semânticas vs Raw

- [ ] Usar variáveis do tema (`bg-primary`, `text-muted-foreground`) ao invés de cores fixas (`bg-blue-500`). Isso garante que o Dark Mode funcione automaticamente, pois usa as CSS variables unificadas do shadcn.

```tsx
// ❌ Errado (Forçando dark mode manual e cores hardcoded)
<div className="bg-slate-100 dark:bg-slate-900 text-blue-500">...</div>

// ✅ Correto (Usando tokens semânticos do shadcn/ui)
<div className="bg-background text-primary">...</div>
```

### ✅ Função `cn()` (clsx + tailwind-merge)

- [ ] Sempre usar `cn()` importado de `lib/utils` para concatenar classes dinâmicas. Isso mescla conflitos de classes do Tailwind de forma inteligente.

```tsx
// ❌ Errado (Concatenação manual com conflitos potenciais)
<div className={`p-4 rounded-md ${isActive ? "bg-primary" : "bg-muted"}`} />;

// ✅ Correto
import { cn } from "@/lib/utils";
<div className={cn("p-4 rounded-md", isActive ? "bg-primary" : "bg-muted")} />;
```

### ✅ Variantes de Componentes com `cva`

- [ ] Para extrair componentes UI reutilizáveis, construa variações com `cva` (class-variance-authority).

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
```

---

# 🟦 2. TypeScript Moderno

### ✅ Tipagem Precisa e Exata

- [ ] Proibido o uso injustificado de `any`. Em casos desconhecidos, prefira `unknown`.
- [ ] Evitar types e interfaces vazias.

```tsx
// ❌ Errado
const handleSubmit = (data: any) => { ... }

// ✅ Correto
type UserPayload = { id: string; email: string };
const handleSubmit = (data: UserPayload): void => { ... }
```

### ✅ Extensão de Props (ComponentProps)

- [ ] Ao estender componentes HTML nativos, prefira herdar propriedades usando `React.ComponentProps` ou `React.ComponentPropsWithoutRef`.

```tsx
// ✅ Correto (Dá acesso a props nativas como onMouseMove, id, aria-labels automaticamente)
interface MyButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  isLoading?: boolean;
}
```

---

# 🧠 3. Componentes e Estrutura

### ✅ Responsabilidade Única

- [ ] O componente faz exatamente o que se propõe. Não misture regra de negócio densa e estado no mesmo arquivo do JSX de representação visual.
- [ ] **Data Fetching:** Isolar requisições em services ou hooks (ex: React Query/SWR). LógiCa de serviço não deve habitar manipuladores de cliques dentro da UI.

---

# 🔄 4. Hooks / useEffect

### ✅ O perigo do useEffect

- [ ] Regras estritas: **Não utilize `useEffect` para transformar/derivar dados** ou recalcular o estado de formatação ("Data transformations").

```tsx
// ❌ Errado (Força re-renders duplos para atualizar um estado dependente localmente)
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Correto (Cálculo inline ou useMemo se for complexo)
const fullName = `${firstName} ${lastName}`; // derivado livremente no scope de render
```

---

# 🔐 5. Segurança & Validação de Inputs

### ✅ ecossistema Zod + Form

- [ ] Não validar na mão ou confiar no backend cegamente. Use padrão Shadcn com `react-hook-form` guiado pelo `zod`.
- [ ] Nunca faça injeção direta sem purificação com bibliotecas dedicadas caso o uso de HTML String seja iminente.

```tsx
import * as z from "zod";
// ✅ Validar dados vindo do form usando zod schema
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username precisa ter pelo menos 2 caracteres.",
  }),
});
```

---

# ⚙️ 6. Lint, Padrões & Performance

### ✅ Organização Impecável e Boa Performance

- [ ] **ESLint & Prettier:** Código com zero warnings. Variáveis não consumidas devem ser removidas.
- [ ] **Renderizações em Lista:** Arrays manipulados devem usar `key` única baseada no identificador de regra de negócio, não o índice (`map((item, index)` ❌).
- [ ] **Desestruturação:** Extrair props explicitamente para a assinatura do componente em vez de propagar objetos grandes como `props.user.details.name`.

---

# 🔥 A Regra Ouro

> Código profissional de Frontend focado é semântico, encapsulado, altamente tipado e tira o maior proveito dos primitivos já oferecidos pelas bibliotecas ativas (Radix UI / Tailwind / React) sem reinventar a roda.

# 🧠 React Code Review Guide (Tailwind + shadcn/ui + TypeScript Moderno)

Checklist completo para revisão de projetos React focados no stack **Tailwind CSS**, **shadcn/ui** e **TypeScript Moderno**. Focado em manutenibilidade, design system consistente e tipagem segura.

---

# 🎨 1. Estilização: Tailwind CSS & shadcn/ui

### ✅ Cores Semânticas vs Raw

- [ ] Usar variáveis do tema (`bg-primary`, `text-muted-foreground`) ao invés de cores fixas (`bg-blue-500`). Isso garante que o Dark Mode funcione automaticamente, pois usa as CSS variables unificadas do shadcn.

```tsx
// ❌ Errado (Forçando dark mode manual e cores hardcoded)
<div className="bg-slate-100 dark:bg-slate-900 text-blue-500">...</div>

// ✅ Correto (Usando tokens semânticos do shadcn/ui)
<div className="bg-background text-primary">...</div>
```

### ✅ Função `cn()` (clsx + tailwind-merge)

- [ ] Sempre usar `cn()` importado de `lib/utils` para concatenar classes dinâmicas. Isso mescla conflitos de classes do Tailwind de forma inteligente.

```tsx
// ❌ Errado (Concatenação manual com conflitos potenciais)
<div className={`p-4 rounded-md ${isActive ? "bg-primary" : "bg-muted"}`} />;

// ✅ Correto
import { cn } from "@/lib/utils";
<div className={cn("p-4 rounded-md", isActive ? "bg-primary" : "bg-muted")} />;
```

### ✅ Variantes de Componentes com `cva`

- [ ] Para extrair componentes UI reutilizáveis, construa variações com `cva` (class-variance-authority).

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
```

---

# 🟦 2. TypeScript Moderno

### ✅ Tipagem Precisa e Exata

- [ ] Proibido o uso injustificado de `any`. Em casos desconhecidos, prefira `unknown`.
- [ ] Evitar types e interfaces vazias.

```tsx
// ❌ Errado
const handleSubmit = (data: any) => { ... }

// ✅ Correto
type UserPayload = { id: string; email: string };
const handleSubmit = (data: UserPayload): void => { ... }
```

### ✅ Extensão de Props (ComponentProps)

- [ ] Ao estender componentes HTML nativos, prefira herdar propriedades usando `React.ComponentProps` ou `React.ComponentPropsWithoutRef`.

```tsx
// ✅ Correto (Dá acesso a props nativas como onMouseMove, id, aria-labels automaticamente)
interface MyButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  isLoading?: boolean;
}
```

---

# 🧠 3. Componentes e Estrutura

### ✅ Responsabilidade Única

- [ ] O componente faz exatamente o que se propõe. Não misture regra de negócio densa e estado no mesmo arquivo do JSX de representação visual.
- [ ] **Data Fetching:** Isolar requisições em services ou hooks (ex: React Query/SWR). LógiCa de serviço não deve habitar manipuladores de cliques dentro da UI.

---

# 🔄 4. Hooks / useEffect

### ✅ O perigo do useEffect

- [ ] Regras estritas: **Não utilize `useEffect` para transformar/derivar dados** ou recalcular o estado de formatação ("Data transformations").

```tsx
// ❌ Errado (Força re-renders duplos para atualizar um estado dependente localmente)
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Correto (Cálculo inline ou useMemo se for complexo)
const fullName = `${firstName} ${lastName}`; // derivado livremente no scope de render
```

---

# 🔐 5. Segurança & Validação de Inputs

### ✅ ecossistema Zod + Form

- [ ] Não validar na mão ou confiar no backend cegamente. Use padrão Shadcn com `react-hook-form` guiado pelo `zod`.
- [ ] Nunca faça injeção direta sem purificação com bibliotecas dedicadas caso o uso de HTML String seja iminente.

```tsx
import * as z from "zod";
// ✅ Validar dados vindo do form usando zod schema
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username precisa ter pelo menos 2 caracteres.",
  }),
});
```

---

# ⚙️ 6. Lint, Padrões & Performance

### ✅ Organização Impecável e Boa Performance

- [ ] **ESLint & Prettier:** Código com zero warnings. Variáveis não consumidas devem ser removidas.
- [ ] **Renderizações em Lista:** Arrays manipulados devem usar `key` única baseada no identificador de regra de negócio, não o índice (`map((item, index)` ❌).
- [ ] **Desestruturação:** Extrair props explicitamente para a assinatura do componente em vez de propagar objetos grandes como `props.user.details.name`.

---

# 🔥 A Regra Ouro

> Código profissional de Frontend focado é semântico, encapsulado, altamente tipado e tira o maior proveito dos primitivos já oferecidos pelas bibliotecas ativas (Radix UI / Tailwind / React) sem reinventar a roda.
