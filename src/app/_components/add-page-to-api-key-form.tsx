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

  const utils = api.useUtils();

  const addPageIdMut = api.notionConfig.addNotionPageId.useMutation({
    onSuccess: async () => {
      await utils.notionConfig.getNotionApiKeysAndPageIds.invalidate();
      reset();
    },
  });

  const onSubmit = (data: FieldValues) => {
    addPageIdMut.mutate({ notionApiKeyId, ...data } as NewPageIdMutInput);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="notionPageId" className="block text-sm">
          Notion DB Page ID
        </label>
        <input
          type="text"
          id="notionPageId"
          {...register("notionPageId")}
          className="border border-gray-300 p-0.5"
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
          <span className="text-xs text-gray-500">*Choose freely</span>
        </label>
        <input
          type="text"
          id="notionDbName"
          {...register("notionDbName")}
          className="border border-gray-300 p-0.5"
        />
        {errors && (
          <p className="mt-2 text-sm text-red-600" id="notionDbName-error">
            {errors.notionDbName?.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="border border-gray-300 px-2 py-0.5 text-sm hover:bg-gray-200"
      >
        {addPageIdMut.isLoading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
