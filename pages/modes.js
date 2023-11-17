import NavBar from '../components/NavBar';

export default function Home() {
  return (
    <div>
      <NavBar />
      <section id="Modes" className="text-white h-screen bg-gray-500  text-center flex">
        <h1 className="m-auto text-7xl text-purple-600 font-bold  ">
          Modes
        </h1>
      </section>
    </div>
  );
}
