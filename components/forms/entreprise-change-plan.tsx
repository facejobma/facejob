import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useToast } from "../ui/use-toast";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import React from "react";
import { Plan } from "@/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Option } from "lucide-react";


const formSchema = z.object({
  entrepriseId: z.string(),
  plan: z.nativeEnum(Plan)
});

type FormValues = z.infer<typeof formSchema>;

export const ChangePlanToEntreprise: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const authToken = Cookies.get("authToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enterprise/${data.entrepriseId}/change-plan`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          variant: "default",
          description: "plan added successfully!"
        });
      } else {
        throw new Error("Failed to add plan");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        variant: "destructive",
        description:
          error.message || "An error occurred while adding plan."
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="entrepriseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entreprise ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Plan to Add" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Plan</SelectLabel>
                    {Object.values(Plan).map((value) => (
                      <SelectItem key={value.toString()} value={value.toString()}>
                        {value.toString()}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="ml-auto" type="submit">
          Change plan
        </Button>
      </form>
    </Form>
  );
};