import './globals.css'

export const metadata = {
  title: '0xGenIgnite Submission Form',
  description: 'Participants submit their projects for 0xGenIgnite here',
  icons: {
    icon: '/logo.png', // 👈 Path to your logo file in /public
  },
}
 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
