// Modified code from https://github.com/shuding/nextra/blob/main/packages/nextra/src/components/cards.tsx

import React, { ReactNode } from 'react'
import cn from 'clsx'
import NextLink from 'next/link'

const classes = {
  card: cn(
    'nextra-card nx-group nx-flex nx-flex-col nx-justify-start nx-overflow-hidden nx-rounded-lg nx-border nx-border-gray-200',
    'nx-text-current nx-no-underline dark:nx-shadow-none',
    'hover:nx-shadow-gray-100 dark:hover:nx-shadow-none nx-shadow-gray-100',
    'active:nx-shadow-sm active:nx-shadow-gray-200',
    'nx-transition-all nx-duration-200 hover:nx-border-gray-300',
    'nx-p-4'
  ),
  title: cn(
    'nx-flex nx-font-semibold nx-items-start nx-gap-2 nx-text-gray-700 hover:nx-text-gray-900'
  ),
  substitle: cn(
    'nx-text-gray-400 nx-pt-1'
  )
}

const arrowEl = (
  <span className="nx-transition-transform nx-duration-75 group-hover:nx-translate-x-[2px]">
    →
  </span>
)

export function Card({
  children,
  title,
  subtitle,
  icon,
  image,
  arrow,
  href,
  ...props
}: {
  children: ReactNode
  title: string
  subtitle: string
  icon: ReactNode
  image?: boolean
  arrow?: boolean
  href: string
}) {
  const animatedArrow = arrow ? arrowEl : null

  if (image) {
    return (
      <NextLink
        href={href}
        className={cn(
          classes.card,
          'nx-bg-gray-100 nx-shadow dark:nx-border-neutral-700 dark:nx-bg-neutral-800 dark:nx-text-gray-50 hover:nx-shadow-lg dark:hover:nx-border-neutral-500 dark:hover:nx-bg-neutral-700'
        )}
        {...props}
      >
        {children}
        <span
          className={cn(
            classes.title,
            'dark:nx-text-gray-300 dark:hover:nx-text-gray-100'
          )}
        >
          {icon}
          <span className="nx-flex nx-gap-1">
            {title}
            {animatedArrow}
          </span>
        </span>
        {subtitle && <div className={classes.substitle}>{subtitle}</div>}
      </NextLink>
    )
  }

  return (
    <NextLink
      href={href}
      className={cn(
        classes.card,
        'nx-bg-transparent nx-shadow-sm dark:nx-border-neutral-800 hover:nx-bg-slate-50 hover:nx-shadow-md dark:hover:nx-border-neutral-700 dark:hover:nx-bg-neutral-900'
      )}
      {...props}
    >
      <span
        className={cn(
          classes.title,
          'dark:nx-text-neutral-200 dark:hover:nx-text-neutral-50 nx-flex nx-items-center'
        )}
      >
        {icon}
        {title}
        {animatedArrow}
      </span>
      {subtitle && <div className={classes.substitle}>{subtitle}</div>}
    </NextLink>
  )
}
