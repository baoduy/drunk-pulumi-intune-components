# Troubleshooting - Drunk Pulumi Intune Components

## Common Issues and Solutions

### Build and Compilation Errors

#### TypeScript Compilation Failures

**Symptom**: `pnpm run build` fails with TypeScript errors

**Common Causes**:
1. Missing or outdated dependencies
2. Type definition mismatches
3. Circular dependencies

**Solutions**:

```bash
# 1. Clean and reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. Check TypeScript version
npx tsc --version

# 3. Run type check to see detailed errors
npx tsc --noEmit

# 4. Check for circular imports
# Review error messages for circular dependency warnings
```

#### Memory Issues During Build

**Symptom**: Build fails with "JavaScript heap out of memory"

**Solution**:

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"
pnpm run build

# Or modify package.json script permanently:
{
  "scripts": {
    "fastBuild": "cross-env NODE_OPTIONS=\"--max-old-space-size=8192\" npx tsc"
  }
}
```

#### tsconfig.json Issues

**Symptom**: Build completes but files missing from output

**Solution**:

```bash
# Update tsconfig.json to include all files
pnpm run update-tsconfig

# Or manually verify tsconfig.json includes all source files
cat tsconfig.json
```

### Authentication Problems

#### Missing Environment Variables

**Symptom**: `Cannot read property of undefined` when accessing credentials

**Error Message**:
```
Error: getaddrinfo ENOTFOUND undefined
TypeError: Cannot read property 'INTUNE_AZURE_TENANT_ID' of undefined
```

**Solution**:

```bash
# Check environment variables are set
echo $INTUNE_AZURE_TENANT_ID
echo $INTUNE_AZURE_CLIENT_ID
echo $INTUNE_AZURE_CLIENT_SECRET

# Set missing variables
export INTUNE_AZURE_TENANT_ID="your-tenant-id"
export INTUNE_AZURE_CLIENT_ID="your-client-id"
export INTUNE_AZURE_CLIENT_SECRET="your-client-secret"

# Or create .env file
cat > .env << EOF
INTUNE_AZURE_TENANT_ID=your-tenant-id
INTUNE_AZURE_CLIENT_ID=your-client-id
INTUNE_AZURE_CLIENT_SECRET=your-client-secret
EOF
```

#### Invalid Credentials

**Symptom**: "401 Unauthorized" or "Invalid client secret"

**Error Message**:
```
Error: Error reading wrap app: 401 Unauthorized
AADSTS7000215: Invalid client secret provided
```

**Solutions**:

1. **Verify credentials in Azure Portal**:
   - Navigate to Azure AD → App registrations
   - Find your service principal
   - Check client ID matches
   - Generate new client secret if expired

2. **Check service principal exists**:
   ```bash
   # Using Azure CLI
   az ad sp show --id YOUR_CLIENT_ID
   ```

3. **Verify tenant ID**:
   ```bash
   # Using Azure CLI
   az account show --query tenantId -o tsv
   ```

#### Insufficient Permissions

**Symptom**: "403 Forbidden" errors when creating policies

**Error Message**:
```
Error: Error reading wrap app: 403 Forbidden
Insufficient privileges to complete the operation
```

**Solutions**:

1. **Grant Required API Permissions**:
   - Navigate to Azure AD → App registrations → Your app
   - Go to API permissions
   - Add Microsoft Graph permissions:
     - `DeviceManagementConfiguration.ReadWrite.All`
     - `DeviceManagementManagedDevices.ReadWrite.All`
     - `DeviceManagementServiceConfig.ReadWrite.All`
     - `Group.Read.All`
   - Click "Grant admin consent"

2. **Verify permissions granted**:
   ```bash
   # Check current permissions
   az ad app permission list --id YOUR_CLIENT_ID
   ```

3. **Wait for permission propagation** (can take 5-10 minutes)

### Microsoft Graph API Issues

#### Rate Limiting

**Symptom**: "429 Too Many Requests" errors

**Error Message**:
```
Error: Error reading wrap app: 429 Too Many Requests
Retry-After: 60
```

**Solutions**:

1. **Implement exponential backoff** (already built-in, but if issue persists):
   ```typescript
   // The library automatically retries, but you can add delays
   await new Promise(resolve => setTimeout(resolve, 5000));
   ```

2. **Batch operations**:
   ```typescript
   // ✅ Good: Use IntuneManagement for multiple policies
   const intune = new IntuneManagement('intune', {
     macOs: {
       compliancePolicy: { /* */ },
       antiVirusPolicy: { /* */ }
     }
   });
   
   // ❌ Bad: Create policies separately
   const policy1 = new MacCompliancePolicy(/* */);
   const policy2 = new ConfigurationPolicy(/* */);
   ```

#### API Endpoint Changes

**Symptom**: Unexpected 404 or method not found errors

**Error Message**:
```
Error: Error reading wrap app: 404 Not Found
Resource not found for the segment 'configurationPolicies'
```

**Solutions**:

1. **Check Microsoft Graph API documentation** for endpoint changes
2. **Update library** to latest version:
   ```bash
   pnpm update @drunk-pulumi/intune-components
   ```

3. **Verify beta endpoint is accessible**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://graph.microsoft.com/beta/deviceManagement/configurationPolicies
   ```

### Policy Deployment Issues

#### Policy Not Applying to Devices

**Symptom**: Policy created successfully but devices not receiving configuration

**Troubleshooting Steps**:

1. **Verify device enrollment**:
   - Check device is enrolled in Intune
   - Verify enrollment type (MDM)
   - Check enrollment status in Intune portal

2. **Check group membership**:
   ```typescript
   // Verify group IDs are correct
   assignments: {
     includeGroups: ['verify-this-group-id']
   }
   ```
   - Confirm group exists in Azure AD
   - Verify device is member of target group
   - Check group is not excluded

3. **Force device sync**:
   - On device: System Preferences → Profiles → Sync
   - Or from Intune portal: Devices → Sync

4. **Check policy conflicts**:
   - Review Intune portal for conflicting policies
   - Higher priority policies may override

5. **Review device compliance report**:
   - Intune portal → Devices → Compliance
   - Check specific device for policy status

#### Assignment Errors

**Symptom**: Policy created but assignment fails

**Error Message**:
```
Error creating assignment: Group not found
```

**Solutions**:

1. **Verify group IDs**:
   ```bash
   # List groups
   az ad group list --query "[].{name:displayName, id:id}" -o table
   
   # Get specific group
   az ad group show --group GROUP_NAME
   ```

2. **Check group type**:
   - Must be Azure AD groups
   - Security groups or Microsoft 365 groups
   - Not distribution lists

3. **Verify group exists in Intune**:
   - Intune portal → Groups
   - May take time to sync from Azure AD

### Custom Configuration Issues

#### Mobile Config File Errors

**Symptom**: Custom configuration fails to deploy

**Error Message**:
```
Error: Invalid payload format
PayloadIdentifier must be unique
```

**Solutions**:

1. **Validate XML syntax**:
   ```bash
   xmllint --noout your-config.mobileconfig
   ```

2. **Check required fields**:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>PayloadIdentifier</key>
       <string>com.company.unique.id</string>
       <key>PayloadType</key>
       <string>Configuration</string>
       <key>PayloadUUID</key>
       <string>UNIQUE-UUID-HERE</string>
       <key>PayloadVersion</key>
       <integer>1</integer>
   </dict>
   </plist>
   ```

3. **Ensure unique PayloadIdentifier**:
   - Each configuration must have unique identifier
   - Use reverse domain notation: `com.company.policy.name`

4. **Validate payload structure**:
   ```bash
   # Use Apple's tools if available
   /usr/bin/profiles -C -v -f your-config.mobileconfig
   ```

#### File Not Found Errors

**Symptom**: Cannot find custom configuration file

**Error Message**:
```
Error: ENOENT: no such file or directory
```

**Solutions**:

1. **Check file path**:
   ```typescript
   import * as path from 'path';
   
   // ✅ Good: Use absolute path
   const configPath = path.resolve(__dirname, './configs/wifi.mobileconfig');
   
   // ❌ Bad: Relative path may fail
   const configPath = './configs/wifi.mobileconfig';
   ```

2. **Verify file exists**:
   ```bash
   ls -la configs/
   ```

3. **Check file permissions**:
   ```bash
   chmod 644 configs/*.mobileconfig
   ```

### Pulumi-Specific Issues

#### State File Conflicts

**Symptom**: "concurrent update detected" errors

**Solutions**:

1. **Wait for other operations to complete**
2. **Cancel stuck operations**:
   ```bash
   pulumi cancel
   ```

3. **Refresh state**:
   ```bash
   pulumi refresh
   ```

4. **Clear pending operations** (use with caution):
   ```bash
   pulumi stack export > backup.json
   pulumi stack import < backup.json
   ```

#### Resource Already Exists

**Symptom**: "resource already exists" errors

**Error Message**:
```
error: resource 'urn:pulumi:stack::project::drunk:intune:MacCompliancePolicy::policy' already exists
```

**Solutions**:

1. **Import existing resource**:
   ```bash
   pulumi import drunk:intune:MacCompliancePolicy policy POLICY_ID
   ```

2. **Or delete and recreate**:
   ```bash
   pulumi destroy --target drunk:intune:MacCompliancePolicy::policy
   pulumi up
   ```

3. **Use different resource name**:
   ```typescript
   // Change the resource name
   const policy = new MacCompliancePolicy('policy-v2', config);
   ```

#### Output Not Available

**Symptom**: Cannot access resource outputs

**Error**:
```
TypeError: Cannot read property 'id' of undefined
```

**Solutions**:

```typescript
// ✅ Good: Use apply for outputs
policy.id.apply(id => {
  console.log(`Policy ID: ${id}`);
  return id;
});

// ✅ Good: Use Output.all for multiple outputs
pulumi.all([policy1.id, policy2.id]).apply(([id1, id2]) => {
  console.log(`IDs: ${id1}, ${id2}`);
});

// ❌ Bad: Treat output as regular value
const id = policy.id;  // This is an Output<string>, not a string
console.log(id.length);  // Error!
```

### Testing Issues

#### Test Environment Setup

**Problem**: Tests fail due to missing dependencies

**Solution**:

```bash
# Navigate to test directory
cd pulumi-test

# Install dependencies
npm install

# Link local library for testing
cd ..
pnpm run build
cd pulumi-test
npm link ../bin

# Run tests
npm test
```

#### Preview Hangs

**Symptom**: `pulumi preview` hangs indefinitely

**Solutions**:

1. **Check network connectivity**:
   ```bash
   curl https://graph.microsoft.com/v1.0
   ```

2. **Verify credentials**:
   ```bash
   # Test authentication
   az login
   az account show
   ```

3. **Increase timeout**:
   ```bash
   pulumi preview --timeout 600
   ```

4. **Check for stuck resources**:
   ```bash
   pulumi cancel
   pulumi refresh
   ```

## Debugging Tips

### Enable Verbose Logging

```bash
# Set Pulumi logging level
export PULUMI_LOG_LEVEL=debug

# Run with verbose output
pulumi up --verbose

# See detailed API calls
pulumi up --logtostderr -v=9
```

### Inspect Resource State

```bash
# View current stack state
pulumi stack export

# View specific resource
pulumi stack export | jq '.deployment.resources[] | select(.type == "drunk:intune:MacCompliancePolicy")'

# List all resources
pulumi stack --show-urns
```

### Test Graph API Directly

```bash
# Get access token
az account get-access-token --resource https://graph.microsoft.com --query accessToken -o tsv

# Test API call
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://graph.microsoft.com/beta/deviceManagement/deviceCompliancePolicies
```

### Validate TypeScript Types

```bash
# Type check without building
npx tsc --noEmit

# Show detailed type errors
npx tsc --noEmit --pretty false
```

## Getting Help

### Before Asking for Help

1. **Check error messages carefully**
2. **Review this troubleshooting guide**
3. **Search GitHub issues**
4. **Check Microsoft Graph API status**
5. **Verify environment setup**

### Information to Provide

When reporting issues, include:

1. **Error message** (full stack trace)
2. **Environment details**:
   ```bash
   node --version
   pnpm --version
   pulumi version
   ```
3. **Minimal reproduction**:
   ```typescript
   // Minimal code that reproduces the issue
   ```
4. **Steps to reproduce**
5. **Expected vs actual behavior**
6. **Pulumi stack info**:
   ```bash
   pulumi stack
   pulumi about
   ```

### Useful Commands for Debugging

```bash
# Check library version
npm list @drunk-pulumi/intune-components

# Verify build output
ls -la bin/

# Check package contents
cat bin/package.json

# Test import
node -e "require('@drunk-pulumi/intune-components')"

# Validate configuration
pulumi config

# Preview without making changes
pulumi preview --diff

# Show detailed plan
pulumi up --preview-only --show-replacement-steps
```

## Common Error Messages Reference

| Error Message | Likely Cause | Solution |
|--------------|-------------|----------|
| `ENOTFOUND undefined` | Missing environment variables | Set INTUNE_AZURE_* variables |
| `401 Unauthorized` | Invalid credentials | Check service principal credentials |
| `403 Forbidden` | Insufficient permissions | Grant Microsoft Graph API permissions |
| `429 Too Many Requests` | Rate limiting | Use IntuneManagement for batching |
| `404 Not Found` | Invalid API endpoint | Update library or check endpoint |
| `PayloadIdentifier must be unique` | Duplicate config identifier | Use unique PayloadIdentifier |
| `concurrent update detected` | State lock conflict | Wait or run `pulumi cancel` |
| `heap out of memory` | Insufficient memory | Increase NODE_OPTIONS max-old-space-size |

## Prevention Best Practices

1. **Always validate credentials before deployment**
2. **Test in development environment first**
3. **Use version control for all configurations**
4. **Monitor Microsoft Graph API status**
5. **Keep library and dependencies updated**
6. **Review Pulumi preview before applying**
7. **Maintain backup of critical configurations**
8. **Document custom configurations**
9. **Use type checking frequently**
10. **Monitor Intune portal for policy status**
