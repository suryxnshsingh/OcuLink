'use client'

import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { LinkPreview } from "@/components/ui/link-preview";

const DeveloperInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-purple-100 border-4 border-purple-800 p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(107,33,168,1)]"
    >
      <div className="flex flex-col items-center">
        <motion.img
          whileHover={{ scale: 1.1 }}
          src="/images/sury.png"
          alt="Developer"
          className="w-32 h-32 rounded-full border-4 border-purple-800 mb-4"
        />
        <h2 className="text-2xl font-bold text-purple-900 mb-2">Suryansh Singh</h2>
        <p className="text-purple-700 mb-4">Full Stack Engineer</p>
        
        <div className="flex space-x-4 z-20">
          <LinkPreview url="https://github.com/suryxnshsingh/" className="font-bold">
            <SocialLink href="https://github.com/suryxnshsingh/" icon={<Github />} />
          </LinkPreview>
          <LinkPreview url="https://x.com/suryxnshsingh/" imageSrc="/images/x.png" isStatic className="font-bold">
            <SocialLink href="https://x.com/suryxnshsingh/" icon={<Twitter />} />
          </LinkPreview>
          <LinkPreview url="https://linkedin.com/in/suryxnshsingh/" imageSrc="/images/in.png" isStatic className="font-bold">
            <SocialLink href="https://linkedin.com/in/suryxnshsingh/" icon={<Linkedin />} />
          </LinkPreview>
            <SocialLink href="mailto:suryxnshsingh@gmail.com" icon={<Mail />} />
        </div>
      </div>
    </motion.div>
  )
}

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => {
  return (
    <motion.a
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-purple-800 hover:text-purple-600 transition-colors"
    >
      {icon}
    </motion.a>
  )
}

export default DeveloperInfo

