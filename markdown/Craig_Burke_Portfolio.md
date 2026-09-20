# Craig Burke

**Salesforce Technical Architect & Principal Developer**

Pittsburgh, PA · Seeking remote roles · [craig@craigburke.com](mailto:craig@craigburke.com) · [craigburke.com](https://www.craigburke.com)

Salesforce Technical Architect and Principal Developer with 8+ years of Salesforce experience and 20+ years of enterprise application development experience.

**Architecture:** Application Architect · Platform Data Architect · Platform Sharing and Visibility Architect  
**Development:** Platform Developer II · Platform Developer I · JavaScript Developer · Platform App Builder  
**Administration:** Advanced Administrator · Administrator

## Integration Projects

Architected and built end-to-end finance, gift, payroll, and student data integrations with data modeling, asynchronous processing, and supporting Lightning web applications.

### Oracle Finance

Designed and built the Oracle Finance integration for CMU’s migration to Salesforce, giving gift entry users control of feed processing, journal entry management, and chart of accounts updates.

*Financial Feed Lightning app.*

**Built with:** Salesforce · Apex · Lightning Web Components · Asynchronous processing · File integration

#### The problem

CMU’s migration from its legacy gift system (Ellucian Advance Web) to Salesforce required a complete architectural redesign of the Oracle Finance integration around Affinaquest’s gift data model. The institutionally critical process was previously controlled by a technical owner, which limited end user visibility and control.

#### Implementation

Built a Salesforce application that gives gift entry users one place to review gift activity, generate and submit Oracle feed files, process responses, and resolve exceptions. Its data model supports accounting mappings and journal entries throughout the financial feed workflow.

#### Results

Load testing validated performance for **700+ feed files and 10K+ transactions per month**. The application automated journal entry creation for prior year gifts, eliminating manual journal entries in most cases. It also simplified chart of accounts changes by moving historical transactions from an existing account number to an updated account number.

### GiveCampus Gift

Built a GiveCampus integration that replaced monthly processing of gifts with daily automation and reduced processing time from hours to minutes.

*Gift Load Lightning app.*

**Built with:** Salesforce · Apex · API integration · Asynchronous processing · Lightning Web Components

#### The problem

CMU’s migration from its legacy gift system (Ellucian Advance Web) to Salesforce required a new integration with the GiveCampus API, replacing the monthly manual gift load. Staff manually reviewed every transaction for known issues and sometimes left Salesforce to research exceptions, a process that could take hours.

#### Implementation

Built a daily API integration and Lightning application that shows gift entry users the state of each loaded gift and surfaces unmatched accounts, missing designations, and other exceptions. When automatic matching cannot make a clear decision, the account matching tool lets users review existing accounts or create a new one.

#### Results

- Load tested for **10K+ gifts per month**
- **Hours → minutes** processing time

Daily automation made gift data available sooner and reduced the manual work required to process it.

### Student Data

Built a student data integration and Lightning application that replaced monthly updates with daily automation for 22K+ students.

*Student data Lightning app.*

**Built with:** Salesforce · Lightning Web Components · Apex · Asynchronous processing

#### The problem

Developers handled student and commencement updates monthly for more than 22K students.

#### Implementation

Built a Lightning application that lets business users run the daily student data load, review individual record results, reconcile data, and resolve load issues without developer involvement.

#### Results

- **22K+** student population
- **Monthly → daily** update cadence

The application lets business users manage daily student data updates without developer involvement.

### Payroll Deduction

Automated payroll deduction gift imports, exports, and pledge creation through a Salesforce integration.

*Payroll Lightning app.*

**Built with:** Salesforce · Apex · Lightning Web Components · Asynchronous processing

#### The problem

Payroll deduction gifts require coordinated payroll exports, payment imports, and pledge creation. Before the integration, those steps were manual and users had limited visibility into each payroll cycle.

#### Implementation

Built a Lightning application that guides users through payment imports and payroll exports, validates payment files, automates pledge creation, and surfaces errors for correction.

#### Results

The application replaced manual import, export, and pledge creation with a single workflow that gives users visibility into each payroll cycle.

## Salesforce Frameworks

This section includes Salesforce frameworks I developed for asynchronous job orchestration, trigger handling, and test data builders. Technical readers can examine a representative Apex example for each framework.

### Asynchronous Job

Framework for building and monitoring multi-step asynchronous Apex processes.

#### Purpose

CMU’s integrations perform ordered work such as retrieving data, matching and validating records, applying updates, and reporting outcomes. Those steps need to run in sequence while remaining visible and traceable.

#### Implementation

The framework composes Batch and Queueable jobs into a defined sequence and logs each job as it runs. It can publish job status and progress through Platform Events and send a completion email summarizing duration, record counts, and errors across the chain.

Individual batch jobs define the records they handle in normal and full runs. A normal run targets records that need processing; a full run includes all eligible records. The framework uses the active run mode to select records and updates only records whose fields changed, minimizing unnecessary updates during high-volume processing.

```apex
public with sharing class ExampleBatch extends BatchJob {
    public override Database.QueryLocator start() {
        allRunWhere.isTrue('Is_Active__c');
        normalRunWhere.isNull('Custom_Field__c');

        return new QueryBuilder('Contact')
            .selectField('Custom_Field__c')
            .whereClause(jobWhere)
            .getQueryLocator();
    }

    public override void execute(List<SObject> records) {
        // Apply updates to custom field
        
        // Only update changed records and log results
        updateLogged(records);
    }
}
```

Individual jobs can be run together in sequence by adding them to a job chain.

```apex
public static Id runChain() {
    return new JobChain(ExampleLoadJobChain.class)
        .publishEvents()
        .addJob(new DownloadQueue())
        .addJob(new MatchRecordsBatch())
        .addJob(new ProcessRecordsBatch())
        .addJob(new ValidateResultsBatch())
        .execute();
}
```

The framework includes a Lightning component for monitoring job chain progress.

![Lightning component for monitoring job chain progress.](/images/asynchronous-job-progress.png)

#### Production use

- Supports 85 production asynchronous Apex jobs.
- Used by finance, gift, payroll, student data, commencement, and scheduled maintenance processes.

### Test Data Builders

Test data builder framework that keeps Apex tests resilient as required fields and object relationships change.

#### Purpose

Before the framework, adding a required field to a shared object such as Account could break every test that created one. Tests also repeated default values and manually assembled related records, making setup brittle and difficult to maintain.

#### Implementation

Builders provide defaults for required and common fields for each object. They can return unsaved records for composition or save related records while resolving lookup relationships. Tests specify only the values relevant to the scenario, while builders create and connect dependent records as needed.

The user builder creates a test user with the profile and permissions needed for the scenario.

```apex
@TestSetup
static void testSetup() {
    TestUtil.user(UserConstant.PROFILE_READ_ONLY)
        .permissionSet(UserConstant.PERMISSION_SET_FINANCIAL_FEED)
        .permissionSet(UserConstant.PERMISSION_SET_PAYROLL)
        .save();
}
```

The test can then create and verify related records in that user context.

```apex
@IsTest
static void testContact() {
    System.runAs(TestUtil.testUser) {
        Account accountRecord = new AccountBuilder()
            .recordType(AccountConstant.RECORD_TYPE_HOUSEHOLD)
            .build();

        Contact contactRecord = new ContactBuilder()
            .account(accountRecord)
            .save();

        Assert.isNotNull(accountRecord.Name, 'A default value is used for the Name field');
        Assert.isNotNull(contactRecord.Id, 'Contact was saved');
        Assert.isNotNull(accountRecord.Id, 'Account was saved with the contact');
        Assert.areEqual(accountRecord.Id, contactRecord.AccountId, 'Contact is linked to account');
    }
}

```

#### Test benefits

- Changes to required fields and default values are updated once in the appropriate builder.
- Tests focus on the values and relationships that matter to the scenario.
- Builders coordinate related records and avoid repeated setup for individual records.
- Test users receive a unique username for each test run, avoiding collisions when tests run in parallel.

### Apex Trigger

Metadata-controlled Apex trigger framework.

#### Purpose

The framework standardizes trigger execution and keeps business logic in focused handler classes.

#### Implementation

Each object has a single trigger that contains only a call to its handler’s `run()` method. 

```apex
trigger ExampleTrigger on Example__c (before insert, before update) {
    new ExampleTriggerHandler().run();
}
```

The base class routes the active trigger operation to the appropriate before or after method, with the relevant new and old records. Handlers override only the methods they need.

Individual handlers can be enabled or disabled through metadata or for a specific transaction at runtime.

```apex
public class ExampleTriggerHandler extends TriggerHandler {

    public override void beforeInsert(List<SObject> newRecords) {
        applyBusinessRules(newRecords);
    }

    public override void beforeUpdate(Map<Id, SObject> oldRecords, Map<Id, SObject> newRecords) {
        applyBusinessRules(newRecords.values());
    }

    static void applyBusinessRules(List<Example__c> examples) {
        // Update fields based on business rules
    }

}
```

#### Production use

- Used as the standard pattern for production trigger handlers.
- Supports direct unit testing of handler behavior without firing a trigger.

## Platform Reliability, Performance, and Security

Improved bulk performance, strengthened sharing and field-level security, and increased test reliability.

- **82%** faster bulk updates for 300K+ Accounts
- **60%** faster bulk updates for 300K+ Contacts
- **483** Apex classes and triggers upgraded to API version 67
- **186** Apex test failures eliminated

I’m seeking a fully remote Salesforce Technical Architect or Lead Developer role. Contact me at [craig@craigburke.com](mailto:craig@craigburke.com).
