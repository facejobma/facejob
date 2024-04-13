"use client";
import * as z from "zod";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";

import { useToast } from "../ui/use-toast";
import FileUpload from "../file-upload";
import Cookies from "js-cookie";

const ImgSchema = z.object({
  fileName: z.string(),
  name: z.string(),
  fileSize: z.number(),
  size: z.number(),
  fileKey: z.string(),
  key: z.string(),
  fileUrl: z.string(),
  url: z.string()
});

export const IMG_MAX_LIMIT = 3;

const formSchema = z.object({
  imgUrl: z
    .array(ImgSchema)
    .max(IMG_MAX_LIMIT, { message: "You can only add up to 3 images" })
    .min(1, { message: "At least one image must be added." }),
  first_name: z
    .string()
    .min(3, { message: "First Name must be at least 3 characters" }),
  sector: z
    .string()
    .min(3, { message: "Sector must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  tel: z.string().min(10, { message: "Invalid phone number" }),
  bio: z.string().min(3, { message: "Bio must be at least 3 characters" })
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: any | null;
  categories: any;
}

export const ProductForm: React.FC<ProductFormProps> = ({
                                                          initialData
                                                        }) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultValues = initialData
    ? initialData
    : {
      first_name: "",
      sector: "",
      email: "",
      tel: "",
      bio: "",
      imgUrl: []
    };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      // Extract candidate ID from params
      const candidateId = params.userId;
      const authToken = Cookies.get("authToken");


      // Send a request to the API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate/updateId/${candidateId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      // Check if the request was successful
      if (response.ok) {
        // Display success toast
        toast({
          title: "succès",
          variant: "default",
          description: "Candidate data saved successfully!"
        });

        // Redirect to the dashboard or candidate details page
        if (candidateId) {
          router.push(`/dashboard/candidate/${candidateId}`);
        } else {
          router.push("/dashboard/products");
        }
      } else {
        // If the request was not successful, display an error toast
        toast({
          title: "Whoops !",
          variant: "destructive",
          description: "Erreur lors de la récupération des données."
        });
      }
    } catch (error: any) {
      // Display error toast
      toast({
        title: "Error",
        variant: "destructive",
        description:
          error.message || "An error occurred while saving candidate data."
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      // Extract candidate ID from params
      const candidateId = params.userId;
      const authToken = localStorage.getItem("authToken");

      // Send a request to delete the candidate
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate/delete/${candidateId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          variant: "default",
          description: "Candidate deleted successfully!"
        });

        router.push("/dashboard/products");
      } else {
        toast({
          title: "Whoops !",
          variant: "destructive",
          description: "Erreur lors de la suppression du candidat."
        });
      }
    } catch (error: any) {
      // Display error toast
      toast({
        title: "Error",
        variant: "destructive",
        description:
          error.message || "An error occurred while deleting the candidate."
      });
    } finally {
      setLoading(false);
    }
  };

  function setOpen(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Candidate Form"
          description="Edit or Create a Candidate"
        />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={onDelete} // Attach the onDelete function to the delete button
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="imgUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <FileUpload
                    onChange={field.onChange}
                    onRemove={field.onChange}
                    value={field.value || []}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Candidate's first name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Candidate's sector"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Candidate's email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="tel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Candidate's phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Candidate's bio"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Save
          </Button>
        </form>
      </Form>
    </>
  );
};
