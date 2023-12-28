import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

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
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-2">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75">
                <span>API Key Name: {conf.notionApiKeyName}</span>
                <ChevronUpIcon
                  className={`${
                    open ? "rotate-180 transform" : ""
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              {/* <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                If you're unhappy with your purchase for any reason, email us
                within 90 days and we'll refund you in full, no questions asked.
              </Disclosure.Panel> */}
              {conf.pageIds.map((page) => (
                <Disclosure.Panel className="px-4 pb-2 pt-4 text-gray-900">
                  <Link href={`/forms/${page.id}`}>{page.notionDbName}</Link>
                </Disclosure.Panel>
              ))}
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
}
