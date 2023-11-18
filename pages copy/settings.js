import NavBar from '../components/NavBar';

export default function Settings() {
  return (
    <div>
      <NavBar />
      <section id="Settings" className="text-white h-screen bg-gray-500 text-center flex">
        <h1 className="m-auto text-7xl text-purple-600 font-bold  ">
          Settings
        </h1>
      </section>
    </div>
  );
}
