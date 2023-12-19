"use client";

import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";

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
      <p>New Notion Credentials</p>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <label htmlFor="notionApiKey" className="block">
            Notion API Key
          </label>
          <input type="text" id="notionApiKey" {...register("notionApiKey")} />
          {errors && (
            <p
              className="mt-2 text-sm text-red-600"
              id="link-notionApiKey-error"
            >
              {errors.notionApiKey?.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="notionApiKeyName" className="block">
            Notion API Key Name
          </label>
          <input
            type="text"
            id="notionApiKeyName"
            {...register("notionApiKeyName")}
          />
          {errors && (
            <p
              className="mt-2 text-sm text-red-600"
              id="link-notionApiKeyName-error"
            >
              {errors.notionApiKeyName?.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="notionPageId" className="block">
            Notion DB Page ID
          </label>
          <input type="text" id="notionPageId" {...register("notionPageId")} />
          {errors && (
            <p
              className="mt-2 text-sm text-red-600"
              id="link-notionPageId-error"
            >
              {errors.notionPageId?.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="notionDbName" className="block">
            Notion DB Name
          </label>
          <input type="text" id="notionDbName" {...register("notionDbName")} />
          {errors && (
            <p
              className="mt-2 text-sm text-red-600"
              id="link-notionDbName-error"
            >
              {errors.notionDbName?.message}
            </p>
          )}
        </div>
        <button type="submit">Save</button>
      </form>
    </>
  );
}
