import type { ReactNode } from 'react'
import Image from 'next/image'
import { httpsUrl } from '@/lib/blog/publishing'
import styles from './magazine.module.css'
export type DirectAdvertisement={sponsor:string;copy:string;cta:string;url:string;image?:string;alt?:string}
type Props={placement:'sidebar'|'in-feed'|'after-article';direct?:DirectAdvertisement;google?:ReactNode;house?:ReactNode}
/** Supply a configured provider creative, direct sponsor, or house creative. No ad scripts are injected here. */
export default function AdSlot({placement,direct,google,house}:Props) {
  const safeDirect=direct&&httpsUrl(direct.url)?direct:undefined
  return <aside className={styles.ad} data-ad-placement={placement} data-ad-kind={house?'house':google?'google':safeDirect?'direct':'placeholder'} aria-label="Advertisement"><p className={styles.adLabel}>Advertisement{safeDirect?' · Sponsored':''}</p>{house||google||(safeDirect?<a className={styles.directAd} href={safeDirect.url} target="_blank" rel="sponsored noopener noreferrer">{safeDirect.image&&httpsUrl(safeDirect.image)&&<Image src={safeDirect.image} alt={safeDirect.alt||safeDirect.sponsor} width={600} height={400} sizes="(max-width: 767px) 100vw, 320px" unoptimized loading="lazy"/>}<strong>{safeDirect.sponsor}</strong><p>{safeDirect.copy}</p><span>{safeDirect.cta} ↗</span></a>:<div className={styles.adPlaceholder}><span>Space for something worthwhile.</span><a href="/contact">Advertise with PurpleSoftHub ↗</a></div>)}</aside>
}
