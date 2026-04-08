import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { clinicsApi, productsApi } from '@/lib/api'
import type { ClinicPublicDto, ProductDto } from '@panexa/shared-types'
import { ClinicStorefront } from './_components/storefront'

interface Props {
  params: { slug: string }
  searchParams: { [key: string]: string | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const clinic: ClinicPublicDto = await clinicsApi.getBySlug(params.slug)
    return {
      title: `${clinic.razaoSocial} — Benefícios de Saúde`,
      description: clinic.marketingSubtitle || `Contrate benefícios de saúde para seus colaboradores via ${clinic.razaoSocial}.`,
    }
  } catch {
    return { title: 'Benefícios de Saúde | Panexa' }
  }
}

export default async function ClinicPage({ params, searchParams }: Props) {
  let clinic: ClinicPublicDto
  try {
    clinic = await clinicsApi.getBySlug(params.slug)
  } catch {
    notFound()
  }

  // Pass UTM + referral info to client component via props
  const tracking = {
    utmSource:   searchParams.utm_source,
    utmMedium:   searchParams.utm_medium,
    utmCampaign: searchParams.utm_campaign,
    referralToken: clinic.id,
    clinicSlug: params.slug,
  }

  return <ClinicStorefront clinic={clinic} tracking={tracking} />
}
