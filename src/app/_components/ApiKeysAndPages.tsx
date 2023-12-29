import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import AddPageToApiKey from "./add-page-to-api-key-form";

export default function ApiKeysAndPageIds({
  conf,
}: {
  conf: {
    id: string;
    notionApiKeyName: string | null;
    createdAt: Date;
    pageIds: {
      id: string;
      createdAt: Date;
      notionDbName: string | null;
    }[];
  };
}) {
  return (
    <div className="w-full px-4 pt-16">
      <div className="mx-auto w-full max-w-md bg-white p-2">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between px-4 py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring ">
                <span>Notion API Key Name: {conf.notionApiKeyName}</span>
                <ChevronUpIcon
                  className={`${open ? "rotate-180 transform" : ""} h-5 w-5`}
                />
              </Disclosure.Button>
              {conf.pageIds.map((page) => (
                <Disclosure.Panel
                  className="mt-0.5 border-b-2 border-gray-100 px-4 pb-2 pt-4 font-thin text-gray-900"
                  key={page.id}
                >
                  <div className="flex justify-between">
                    <div>Page ID Name: {page.notionDbName}</div>
                    <div>
                      <Link
                        href={`/forms/${page.id}`}
                        className="hover:underline hover:underline-offset-8"
                      >
                        go to form
                      </Link>
                    </div>
                  </div>
                </Disclosure.Panel>
              ))}
              <Disclosure.Panel className="mt-0.5 border-b-2 border-gray-100 px-4 pb-2 pt-4 font-thin text-gray-900">
                <h1>Add new Page ID (Notion DB reference)</h1>
                <div className="h-2" />
                <AddPageToApiKey notionApiKeyId={conf.id} />
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
}
