export default function Test() {
  return (
    <div>
      {/* <Wrapper>
        <Inside></Inside>
      </Wrapper> */}
    </div>
  );
}

function Wrapper({ children }) {
  return (
    <div className="bg-blue-100 p-10">
      wrapper
      {children}
    </div>
  );
}

function Inside() {
  return <div className="bg-red-100">Inside</div>;
}


function Context(){
    
}