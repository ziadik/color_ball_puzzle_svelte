<!-- src/components/LevelEditor.svelte -->
<script>
  import LevelPreview from '../components/editor/LevelPreview.svelte';
  import { levels } from '../lib/data/levels.js';

  const objects = levels[0].objects.map(r => r.split(' ').map(v => parseInt(v) || 0));
  let w = $state(600);
  let h = $state(600);
  let el = $state(null);
</script>

<div bind:this={el} bind:clientWidth={w} bind:clientHeight={h} style="width: 100%; height: 100%;">
  <LevelPreview objectsGrid={objects} containerWidth={w} containerHeight={h} />
</div>