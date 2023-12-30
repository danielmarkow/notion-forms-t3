"use client";

import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import Link from "next/link";

const newCredentialsSchema = z.object({
  notionApiKey: z.string(),
  notionApiKeyName: z.string(),
  notionPageId: z.string(),
  notionDbName: z.string(),
});

type NewCredentials = z.infer<typeof newCredentialsSchema>;

export default function NewCredentials() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewCredentials>({
    resolver: zodResolver(newCredentialsSchema),
  });

  const addNotionCredentialsMut =
    api.notionConfig.addNotionCredentials.useMutation({
      onSuccess: () => reset(),
    });

  const submit = (data: FieldValues) => {
    addNotionCredentialsMut.mutate(data as NewCredentials);
  };

  return (
    <>
      <h1 className="text-sm font-medium">New Notion Credentials</h1>
      <div className="h-5" />
      <div className="flex justify-center">
        <form onSubmit={handleSubmit(submit)} className="w-2/3 text-sm">
          <div>
            <label htmlFor="notionApiKey" className="block text-sm">
              Notion API Key
            </label>
            <input
              type="text"
              id="notionApiKey"
              {...register("notionApiKey")}
              className="w-full border border-gray-300 p-0.5"
            />
            {errors && (
              <p className="mt-2 text-sm text-red-600" id="notionApiKey-error">
                {errors.notionApiKey?.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="notionApiKeyName" className="block text-sm">
              Notion API Key Name
              <div />
              <span className="text-xs text-gray-500">Choose freely</span>
            </label>
            <input
              type="text"
              id="notionApiKeyName"
              className="w-full border border-gray-300 p-0.5"
              {...register("notionApiKeyName")}
            />
            {errors && (
              <p
                className="mt-2 text-sm text-red-600"
                id="notionApiKeyName-error"
              >
                {errors.notionApiKeyName?.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="notionPageId" className="block text-sm">
              Notion DB Page ID
            </label>
            <input
              type="text"
              id="notionPageId"
              {...register("notionPageId")}
              className="w-full border border-gray-300 p-0.5"
            />
            {errors && (
              <p className="mt-2 text-sm text-red-600" id="notionPageId-error">
                {errors.notionPageId?.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="notionDbName" className="block text-sm">
              Notion DB Name
              <div />
              <span className="text-xs text-gray-500">Choose freely</span>
            </label>
            <input
              type="text"
              id="notionDbName"
              {...register("notionDbName")}
              className="w-full border border-gray-300 p-0.5"
            />
            {errors && (
              <p
                className="mt-2 text-sm text-red-600"
                id="link-notionDbName-error"
              >
                {errors.notionDbName?.message}
              </p>
            )}
          </div>
          <div className="h-5" />
          <div className="flex gap-2">
            <button
              type="submit"
              className="border border-gray-300 px-2 py-0.5 text-sm hover:bg-gray-200"
            >
              {addNotionCredentialsMut.isLoading ? "Saving..." : "Save"}
            </button>
            <Link href="/config">
              <button
                type="submit"
                className="border border-red-300 bg-red-100 px-2 py-0.5 text-sm hover:bg-red-200"
              >
                Abort
              </button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
