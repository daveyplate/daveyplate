import { useRouter } from "next/router"
import { useLocale } from "next-intl"

import Flag from "react-flagpack"
import { Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import { ChevronDownIcon } from "@heroicons/react/24/solid"

import i18nConfig from 'i18n.config'
import { getPathname, usePathname } from "@/i18n/routing"
import { isExport } from "@/utils/utils"

export const localeToCountry = {
  "en": "US",
  "de": "DE",
  "es": "ES",
  "ja": "JP",
  "zh": "CN",
  "it": "IT",
  "ko": "KR",
  "fr": "FR",
  "ru": "RU",
  "he": "IL",
  "uk": "UA",
  "hi": "IN",
  "ar": "SA",
  "tr": "TR",
  "pt": "PT",
}

/**
 * Dropdown component to switch between locales
 * @param {Object} props
 * @param {Array} props.locales - Array of locales
 * @param {String} props.locale - Current locale
 * @param {Boolean} [props.isIconOnly=false] - If true, only flag icon will be displayed
 * @param {("sm"|"md"|"lg")} [props.size="md"] - Size of the button
 * @param {("bordered"|"faded"|"flat"|"light"|"ghost"|"solid")} [props.variant="solid"] - Variant of the button
 * @returns {JSX.Element}
 */
export default function LocaleDropdown({ isIconOnly = false, size = "md", variant = "solid" }) {
  const router = useRouter()
  const currentLocale = useLocale()
  const pathname = usePathname()
  const locales = i18nConfig.i18n.locales

  const handleLocaleChange = (locale) => {
    if (isExport()) {
      router.replace(getPathname({ href: pathname, locale }), null, { scroll: false })
    } else {
      router.replace(pathname, null, { locale, scroll: false })
    }
  }

  return (
    <Dropdown size={size} classNames={{ content: cn(isIconOnly && "min-w-fit") }}>
      <DropdownTrigger>
        <Button
          isIconOnly={isIconOnly}
          size={size}
          variant={variant}
          startContent={
            <Flag
              className={cn(!isIconOnly && "-ms-0.5 me-1")}
              code={localeToCountry[currentLocale]}
              gradient="real-linear"
              size="m"
              hasDropShadow
            />
          }
          endContent={!isIconOnly &&
            <ChevronDownIcon className="size-5 mt-0.5 -me-1" />
          }
        >
          {!isIconOnly && new Intl.DisplayNames([currentLocale], { type: 'language' }).of(currentLocale)}
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        itemClasses={{
          title: "text-base",
          base: "px-3 gap-3.5",
        }}
      >
        {locales.map((locale) => (
          <DropdownItem
            key={locale}
            startContent={
              <Flag
                code={localeToCountry[locale]}
                gradient="real-linear"
                size="m"
                hasDropShadow
              />
            }
            title={new Intl.DisplayNames([currentLocale], { type: 'language' }).of(locale)}
            onPress={() => handleLocaleChange(locale)}
          />
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}