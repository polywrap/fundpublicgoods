import { Listbox } from "@headlessui/react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

interface DropdownProps {
  items: { value: string; image?: string }[];
  field: any;
  onChange?: (value: string) => void;
}

const Dropdown = ({ items, field, onChange }: DropdownProps) => {
  const listboxProps = {
    ...field,
    ...(onChange && { onChange }), // Spread the onChange prop if it exists
  };
  return (
    <Listbox {...listboxProps}>
      <div className="relative w-full">
        <Listbox.Button className="text-sm leading-none flex space-x-1 bg-white border-2 border-indigo-100 hover:text-indigo-600 px-3 py-1.5 hover:bg-indigo-100 transition-colors duration-500 ease-in-out rounded-lg">
          <div className="flex flex-wrap gap-2 items-center">
            {field.image && (
              <Image
                width={18}
                height={18}
                src={field.image}
                alt={field.image}
              />
            )}
            {field.value}
          </div>
          <CaretDown weight="bold" />
        </Listbox.Button>
        {items.length > 0 && (
          <Listbox.Options className="absolute z-10 mt-1 bg-white shadow-lg shadow-primary-shadow/20 max-h-60 rounded-lg pt-1 ring-1 ring-white ring-opacity-5 focus:outline-none sm:text-sm">
            {items.map((item) => (
              <Listbox.Option
                key={item.value}
                value={item.value}
                className={`cursor-pointer select-none relative p-1.5 rounded-md hover:bg-indigo-50 hover:text-indigo-600`}
              >
                <div className="flex gap-2 pr-1 py-2 items-center">
                  {item.image && (
                    <Image
                      width={18}
                      height={18}
                      src={item.image}
                      alt={item.image}
                    />
                  )}
                  {item.value}
                </div>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        )}
      </div>
    </Listbox>
  );
};

export default Dropdown;
