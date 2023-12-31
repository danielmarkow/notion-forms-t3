"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { classNames } from "../_utils/cssUtils";

export default function ConfigNotion() {
  const notionConfigQry =
    api.notionConfig.getNotionApiKeysAndPageIds.useQuery();

  if (notionConfigQry.isLoading) {
    return <p className="text-sm font-medium text-gray-600">Loading...</p>;
  }

  if (notionConfigQry.isError) {
    return (
      <p className="text-sm font-medium text-gray-600">
        An error occurred fetching config data
      </p>
    );
  }

  if (notionConfigQry.isSuccess)
    return (
      <>
        {notionConfigQry.data.length > 0 && (
          <>
            <div className="h-10" />
            <h1 className="text-sm">Your Notion API Keys</h1>
            {notionConfigQry.data.map((conf) => (
              <div
                key={conf.id}
                className="border-gray-300pb-2 flex flex-col border-b pt-2"
              >
                <div className="flex gap-x-1 align-middle">
                  <h1 className="pb-1 text-sm font-medium">
                    {conf.notionApiKeyName}
                  </h1>
                  <TrashIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="px-2 pb-1">
                  <ul className="list-none text-sm">
                    {conf.pageIds.map((page) => (
                      <li>
                        <div className="flex justify-between">
                          <div>
                            <Link href={`/forms/${page.id}`}>
                              {page.notionDbName}{" "}
                              <span className="text-xs text-gray-500">
                                click to visit form
                              </span>
                            </Link>
                            <div className="pt-1">
                              <PrivateBadge />
                            </div>
                          </div>

                          <div>
                            <PageIdDropDown />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* <ApiKeysAndPageIds conf={conf} /> */}
              </div>
            ))}
            <div className="h-2" />
            <div className="flex justify-center">
              <Link href="/config/new">
                <button
                  type="button"
                  className="border border-gray-300 px-2 py-0.5 text-sm font-thin text-gray-900 hover:bg-gray-200"
                >
                  Add new Notion API key
                </button>
              </Link>
            </div>
          </>
        )}
        {notionConfigQry.data.length === 0 && (
          <>
            <div className="h-5" />
            <p className="text-sm">No Notion API keys configured yet</p>
            <p className="text-sm">Click to add one</p>
            <div className="h-2" />
            <div className="flex justify-center">
              <Link href="/config/new">
                <button
                  type="button"
                  className="border border-gray-300 px-2 py-0.5 text-sm font-thin text-gray-900 hover:bg-gray-200"
                >
                  Add new Notion API key
                </button>
              </Link>
            </div>
          </>
        )}
      </>
    );
}

function PageIdDropDown() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm",
                  )}
                >
                  Make Form Public
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm",
                  )}
                >
                  Delete
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function PublicBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
      Public
    </span>
  );
}

function PrivateBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
      Private
    </span>
  );
}
