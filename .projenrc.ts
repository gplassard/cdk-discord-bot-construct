import { TypescriptLibraryProject } from '@gplassard/projen-extensions';

const project = new TypescriptLibraryProject({
  name: 'cdk-discord-bot-construct',
  packageName: '@gplassard/cdk-discord-bot-construct',
  devDeps: ['aws-cdk-lib', 'constructs', 'esbuild', 'slash-create', '@types/aws-lambda'],
  peerDeps: ['aws-cdk-lib', 'constructs', 'slash-create'],
});
project.synth();
