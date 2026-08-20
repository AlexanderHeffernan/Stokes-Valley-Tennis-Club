import type { Component } from 'vue'
import {
  PhCalendar, PhCamera, PhChatCircle, PhCheckCircle, PhClock, PhCurrencyDollar,
  PhEnvelope, PhFlag, PhHandshake, PhHeart, PhHouse, PhInfo, PhLightning,
  PhMapPin, PhMedal, PhMegaphone, PhNewspaper, PhPersonSimpleRun, PhPhone,
  PhShieldCheck, PhSmiley, PhStar, PhStudent, PhSun, PhTennisBall, PhTicket,
  PhTrophy, PhUser, PhUsersThree
} from '@phosphor-icons/vue'

export const cmsIconComponents: Record<string, Component> = {
  calendar: PhCalendar,
  camera: PhCamera,
  'chat-circle': PhChatCircle,
  'check-circle': PhCheckCircle,
  clock: PhClock,
  'currency-dollar': PhCurrencyDollar,
  envelope: PhEnvelope,
  flag: PhFlag,
  handshake: PhHandshake,
  heart: PhHeart,
  house: PhHouse,
  info: PhInfo,
  lightning: PhLightning,
  'map-pin': PhMapPin,
  medal: PhMedal,
  megaphone: PhMegaphone,
  newspaper: PhNewspaper,
  'person-simple-run': PhPersonSimpleRun,
  phone: PhPhone,
  'shield-check': PhShieldCheck,
  smiley: PhSmiley,
  star: PhStar,
  student: PhStudent,
  sun: PhSun,
  'tennis-ball': PhTennisBall,
  ticket: PhTicket,
  trophy: PhTrophy,
  user: PhUser,
  'users-three': PhUsersThree
}
