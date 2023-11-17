import NavBar from '../components/NavBar';

export default function Home() {
  return (
    <div>
      <NavBar />
      <section id="modes" className="text-white h-screen bg-gray-500  text-center flex">
        <h1 className="m-auto text-7xl text-purple-600 font-bold  ">
          Modes
        </h1>
      </section>
      <section id="effects" className=" text-white h-screen bg-purple-900 flex">
        <h1 className="m-auto text-7xl text-white font-bold">
          Effects
        </h1>
      </section>
      <section id="color" className="text-white h-screen bg-gray-500  text-center flex">
        <h1 className="m-auto text-7xl text-purple-600 font-bold">
          Color
        </h1>
      </section>
      <section id="settings" className=" text-white h-screen bg-purple-900 flex">
        <h1 className="m-auto text-7xl text-white font-bold">
          Settings
        </h1>
      </section>
      <section id="status" className=" text-white h-screen bg-gray-500 flex">
        <h1 className="m-auto text-7xl text-white font-bold">
          Status
        </h1>
      </section>
    </div>
  );
}
