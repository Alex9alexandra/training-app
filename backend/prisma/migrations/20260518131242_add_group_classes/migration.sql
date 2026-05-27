BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[GroupClass] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [scheduledAt] DATETIME2 NOT NULL,
    [maxCapacity] INT NOT NULL,
    [currentCapacity] INT NOT NULL CONSTRAINT [GroupClass_currentCapacity_df] DEFAULT 0,
    CONSTRAINT [GroupClass_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ClientClassEnrollment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [clientId] INT NOT NULL,
    [classId] INT NOT NULL,
    [enrolledAt] DATETIME2 NOT NULL CONSTRAINT [ClientClassEnrollment_enrolledAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ClientClassEnrollment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ClientClassEnrollment_clientId_classId_key] UNIQUE NONCLUSTERED ([clientId],[classId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ClientClassEnrollment_classId_idx] ON [dbo].[ClientClassEnrollment]([classId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ClientClassEnrollment_clientId_idx] ON [dbo].[ClientClassEnrollment]([clientId]);

-- AddForeignKey
ALTER TABLE [dbo].[ClientClassEnrollment] ADD CONSTRAINT [ClientClassEnrollment_clientId_fkey] FOREIGN KEY ([clientId]) REFERENCES [dbo].[Client]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ClientClassEnrollment] ADD CONSTRAINT [ClientClassEnrollment_classId_fkey] FOREIGN KEY ([classId]) REFERENCES [dbo].[GroupClass]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
