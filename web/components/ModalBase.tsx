import { PropsWithChildren, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import clsx from "clsx";
import { X } from "@phosphor-icons/react";
import Button from "./Button";

export interface ModalProps {
  title: string | ReactNode;
  isOpen: boolean;
  onClose: () => void;
  panelStyles?: {
    maxWidth?: string;
    other?: string;
  };
  contentStyles?: {
    padding?: string;
    "max-h"?: string;
    spacing?: string;
    overflow?: string;
    other?: string;
  };
}

export default function Modal(props: PropsWithChildren<ModalProps>) {
  const { title, isOpen, onClose, panelStyles, contentStyles, children } =
    props;
  const maxWidth = panelStyles?.maxWidth ?? "max-w-[540px]";

  const defaultContentStyles = clsx(
    "bg-white [scrollbar-gutter:stable] rounded-b-2xl",
    contentStyles?.padding ? contentStyles?.padding : "p-4 sm:p-6 pr-[1.5rem]",
    contentStyles?.["max-h"]
      ? contentStyles?.["max-h"]
      : "max-h-[calc(100vh-102px)] md:max-h-[calc(100vh-108px)]",
    contentStyles?.spacing ? contentStyles?.spacing : "space-y-8",
    contentStyles?.overflow ? contentStyles?.overflow : "overflow-y-auto",
    contentStyles?.other
  );

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-30' onClose={onClose}>
          <div className='fixed inset-0 overflow-y-auto bg-indigo-900/50 backdrop-blur [scrollbar-gutter:stable] '>
            <div className='flex min-h-full items-center justify-center p-1 text-center md:p-4'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='ease-in duration-50'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'>
                <Dialog.Panel
                  className={clsx(
                    "w-full rounded-2xl bg-white text-left align-middle shadow-xl relative",
                    maxWidth
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}>
                  <div className='flex items-start justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 pr-8'>
                    <Dialog.Title className='text-base font-bold w-full'>
                      {title}
                    </Dialog.Title>
                  </div>
                  <div className='absolute top-3 right-3'>
                    <Button
                      variant='icon'
                      onClick={onClose}
                      className='!shadow-none !bg-transparent'>
                      <X
                        size={20}
                        weight='bold'
                        className='transition-opacity duration-300 ease-in-out group-hover:opacity-50 text-indigo-600'
                      />
                    </Button>
                  </div>
                  <div className={defaultContentStyles}>{children}</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
