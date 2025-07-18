import React from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import { IosPickerItem } from '@/components/emblaCarousel/EmblaCarouselIosPickerItem'

type TimeWheelPickerProps = {
  loop?: EmblaOptionsType['loop']
  hour: string
  setHour: (value: string) => void
  minute: string
  setMinute: (value: string) => void
  ampm: string
  setAmpm: (value: string) => void
}

const TimeWheelPicker: React.FC<TimeWheelPickerProps> = ({
  loop,
  setHour,
  setMinute,
  setAmpm
}) => {
  const hourItems = Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  const minuteItems = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  )
  const amPmItems = ['AM', 'PM']

  return (
    <div className="embla flex gap-4">
      <IosPickerItem
        items={hourItems}
        perspective="left"
        loop={loop}
        label="HH"
        onSelect={setHour}
      />
      <IosPickerItem
        items={minuteItems}
        perspective="right"
        loop={loop}
        label="MM"
        onSelect={setMinute}
      />
      <IosPickerItem
        items={amPmItems}
        perspective="left"
        loop={loop}
        label=""
        onSelect={setAmpm}
      />
    </div>
  )
}

export default TimeWheelPicker
