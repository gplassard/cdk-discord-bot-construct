// .projenrc.ts
import { TypescriptLibraryProject } from '@gplassard/projen-extensions';

// opinionated wrapper around projen TypeScriptProject for libraries
const project = new TypescriptLibraryProject({
    name: 'cdk-discord-bot-construct',
    packageName: '@gplassard/cdk-discord-bot-construct',
    devDeps: ['aws-cdk-lib', 'constructs', 'esbuild', 'slash-create'],
    peerDeps: ['aws-cdk-lib', 'constructs', 'slash-create'],
});
project.synth();
