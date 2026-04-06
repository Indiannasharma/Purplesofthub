'use client'

import { useEffect, useRef } from 'react'

interface MapProps {
  data: Record<string, number>
}

export default function ClientWorldMap({
  data
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const loadMap = async () => {
      const { default: jsVectorMap } =
        await import('jsvectormap')
      await import(
        'jsvectormap/dist/maps/world.js'
      )

      if (mapInstance.current) {
        mapInstance.current.destroy()
      }

      mapInstance.current = new jsVectorMap({
        selector: mapRef.current,
        map: 'world',
        zoomButtons: false,
        zoomOnScroll: false,
        backgroundColor: 'transparent',
        regionStyle: {
          initial: {
            fill: '#1a0f35',
            stroke: '#2d1b69',
            strokeWidth: 0.5,
          },
          hover: {
            fill: '#7c3aed',
            cursor: 'pointer',
          },
          selected: {
            fill: '#a855f7',
          },
        },
        series: {
          regions: [{
            values: data,
            scale: ['#4c1d95', '#a855f7'],
            normalizeFunction: 'polynomial',
          }],
        },
        onRegionTooltipShow(
          event: any,
          tooltip: any,
          code: string
        ) {
          const value = data[code]
          tooltip.text(
            value
              ? `${tooltip.text()}: ${value} client${value > 1 ? 's' : ''}`
              : tooltip.text()
          )
        },
      })
    }

    loadMap()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div
      ref={mapRef}
      style={{ height: '320px' }}
      className="w-full"
    />
  )
}
