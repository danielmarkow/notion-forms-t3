"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { Fragment, useRef, useState } from "react";
import { classNames } from "../_utils/cssUtils";

export default function ConfigNotion() {
  const [openApiKeyDelWarning, setOpenApiKeyDelWarning] = useState(false);

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
                className="flex flex-col border-b border-gray-300 pb-2 pt-2"
              >
                <div className="flex gap-x-1 align-middle">
                  <h1 className="pb-1 text-sm font-medium">
                    {conf.notionApiKeyName}
                  </h1>
                  <TrashIcon
                    className="h-5 w-5 cursor-pointer text-gray-400"
                    onClick={() => setOpenApiKeyDelWarning(true)}
                  />
                </div>
                <div className="px-2 pb-1">
                  <ul className="list-none text-sm">
                    {conf.pageIds.map((page) => (
                      <li key={page.id}>
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
                <ApiKeyDeletionWarning
                  open={openApiKeyDelWarning}
                  setOpen={setOpenApiKeyDelWarning}
                  notionApiKeyId={conf.id}
                />
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

function ApiKeyDeletionWarning({
  open,
  setOpen,
  notionApiKeyId,
}: {
  open: boolean;
  setOpen: (arg: boolean) => void;
  notionApiKeyId: string;
}) {
  const utils = api.useUtils();

  const removeNotionApiKeyMut = api.notionConfig.removeNotionApiKey.useMutation(
    {
      onSuccess: async () => {
        await utils.notionConfig.getNotionApiKeysAndPageIds.invalidate();
        setOpen(false);
      },
    },
  );

  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Delete Notion API Key
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete your Notion API key? All
                        the associated Page IDs will be deleted as well. This
                        action cannot be reversed!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={() =>
                      removeNotionApiKeyMut.mutate({ notionApiKeyId })
                    }
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
