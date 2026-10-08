import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PublicationMasthead from '@/components/blog/PublicationMasthead'
import styles from '@/components/blog/magazine.module.css'
export default function Loading(){return <><Navbar/><main className={styles.publicationPage} aria-busy="true" aria-label="Loading stories"><div className={styles.container}><PublicationMasthead loading/><div className={styles.leadArea}><div><div className={styles.skeletonLead}/><div className={styles.skeletonTitle}/><div className={styles.skeletonDeck}/></div><div className={styles.secondary}><div><div className={styles.skeletonFeature}/><div className={styles.skeletonTitle}/></div><div><div className={styles.skeletonFeature}/><div className={styles.skeletonTitle}/></div></div></div><p className="sr-only" role="status">Loading stories…</p></div></main><Footer/></>}
