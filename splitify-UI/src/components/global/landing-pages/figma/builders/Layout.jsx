
export default function Layout({ children, className="" }) {
  return (
    <div className="w-full h-full flex justify-center overflow-hidden">
      <div
        className={`
 grid grid-cols-12 box-content  
   py-12 sm:py-20
   w-full
   px-2 sm:px-20 
   ${className}
`}
      >
        {children}
      </div>
    </div>
  );
}
