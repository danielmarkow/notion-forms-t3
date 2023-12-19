"use client";

import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";

const newPageId = z.object({
  notionPageId: z.string(),
  notionDbName: z.string(),
});

type NewPageId = z.infer<typeof newPageId>;
type NewPageIdMutInput = NewPageId & { notionApiKeyId: string };

export default function AddPageToApiKey({
  notionApiKeyId,
}: {
  notionApiKeyId: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewPageId>({
    resolver: zodResolver(newPageId),
  });

  const addPageIdMut = api.notionConfig.addNotionPageId.useMutation();

  const onSubmit = (data: FieldValues) => {
    addPageIdMut.mutate({ notionApiKeyId, ...data } as NewPageIdMutInput);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="notionPageId" className="block">
          Notion DB Page ID
        </label>
        <input type="text" id="notionPageId" {...register("notionPageId")} />
      </div>
      <div>
        <label htmlFor="notionDbName" className="block">
          Notion DB Name
        </label>
        <input type="text" id="notionDbName" {...register("notionDbName")} />
      </div>
      <button type="submit">Save</button>
    </form>
  );
}
