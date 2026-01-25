"use client";
import { ButtonLoading } from "@/components/ui/loading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const formSchema = z.object({
  email: z.string().email({ message: "Entrez une adresse courriel valide" }),
  password: z.string().min(6, {
    message: "Le mot de passe doit comporter au moins 6 caractères",
  }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: UserFormValue) => {
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        const data = await res.json();

        const { token } = data;

        Cookies.set("authToken", token, { expires: 7 });

        if (res.ok) {
          toast({
            title: "succès!",
            variant: "default",
            description: "Vous êtes connecté avec succès!",
          });
          // redirect to dashboard
          router.push("/dashboard");
        } else throw new Error(data.message);
      })
      .catch((error) => {
        return toast({
          title: "Désolé!",
          variant: "destructive",
          description: error.message,
        });
      });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ formState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Entrez votre email..."
                    disabled={formState.isLoading}
                    {...form.register("email")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ formState }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Entrez votre mot de passe..."
                    disabled={formState.isLoading}
                    {...form.register("password")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ButtonLoading
            loading={form.formState.isLoading}
            loadingText="Connexion en cours..."
            className="ml-auto w-full"
            type="submit"
          >
            Connexion
          </ButtonLoading>
        </form>
      </Form>
    </>
  );
}
