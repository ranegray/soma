function Settings() {
  return (
    <div className='bg-background flex min-h-screen'>
      <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Connection Settings
          </h2>
          <p className='text-muted-foreground'>
            Configure connections to your robot
          </p>
        </div>

        <div className='grid gap-4'></div>
      </div>
    </div>
  );
}

export default Settings;
