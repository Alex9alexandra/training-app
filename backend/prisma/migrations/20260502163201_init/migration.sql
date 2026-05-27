BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Client] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [age] INT NOT NULL,
    CONSTRAINT [Client_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Workout] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [clientId] INT NOT NULL,
    CONSTRAINT [Workout_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Exercise] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [sets] INT NOT NULL,
    [reps] INT NOT NULL,
    [weight] FLOAT(53) NOT NULL,
    [workoutId] INT NOT NULL,
    CONSTRAINT [Exercise_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Measurement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [height] FLOAT(53) NOT NULL,
    [weight] FLOAT(53) NOT NULL,
    [muscularMassPercent] FLOAT(53) NOT NULL,
    [fatMassPercent] FLOAT(53) NOT NULL,
    [boneMassPercent] FLOAT(53) NOT NULL,
    [leanBodyMassPercent] FLOAT(53) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [clientId] INT NOT NULL,
    CONSTRAINT [Measurement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Workout] ADD CONSTRAINT [Workout_clientId_fkey] FOREIGN KEY ([clientId]) REFERENCES [dbo].[Client]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Exercise] ADD CONSTRAINT [Exercise_workoutId_fkey] FOREIGN KEY ([workoutId]) REFERENCES [dbo].[Workout]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Measurement] ADD CONSTRAINT [Measurement_clientId_fkey] FOREIGN KEY ([clientId]) REFERENCES [dbo].[Client]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
