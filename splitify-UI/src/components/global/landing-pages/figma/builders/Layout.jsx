
export default function Layout({ children, className }) {
  return (
    <div className="w-full h-full overflow-hidden">
      <div
        className={`
  max-w-[1440px] m-auto grid grid-cols-12 box-content
   py-20 px-2 sm:px-20 
   ${className}
`}
      >
        {children}
      </div>
    </div>
  );
}
